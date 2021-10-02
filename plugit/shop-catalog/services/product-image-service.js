const _ = require('lodash')
const { db } = require('#/express')
const { ApiRes, emitter } = require('#/utils')

class ProductImageService {
	/**
	 * @param {{
	 * 	id?: number,
	 * 	productId?: string,
	 * 	managedEvent?: Object,
	 * 	pos?: number,
	 * 	file?: Object
	 * }} data
	 */
	static async save(data) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let { id, productId, managedEvent } = data
			let isNew = !id
			let image = isNew ? db.ProductImage.build() : await db.ProductImage.findByPk(id)

			if (!image) {
				apiRes.validation('id', 'La imagen es inexistente o ha sido eliminada')
				throw null
			}

			let def = { pos: undefined, file: undefined }
			data = _.pickBy(_.defaults(data, def), (v, k) => k in def && (isNew || v !== undefined))

			let results = await image.setAndValidate(data)

			if (results === true) {
				apiRes.data({ image })
			} else {
				apiRes.validation(results)
				throw null
			}

			let fn = async ({ productId }) => {
				await image.uploadFile('file')
				await image.set({ productId }).save()
				await emitter.emit('Product.images.SET', {
					id: productId,
					imageId: image.id,
					subEvent: isNew ? 'ADD' : 'UPDATE',
					managedEvent,
				})
			}

			if (managedEvent) {
				await managedEvent.onEmit(fn)
				managedEvent.onCancel(() => {
					if (image.changed('file')) image.unlinkImages()
				})
			} else {
				await fn({ productId })
			}
		})
		return apiRes
	}

	static async delete(id, managedEvent = null) {
		let image = await db.ProductImage.findByPk(id)
		if (image) {
			await db.$transaction(async (t) => {
				let fn = async () => {
					await image.destroy()
					await emitter.emit('Product.images.SET', {
						id: image.productId,
						imageId: image.id,
						subEvent: 'REMOVE',
						managedEvent,
						t,
					})
				}
				managedEvent ? await managedEvent.onEmit(fn) : await fn()
			})
		}
		return ApiRes()
	}
}

module.exports = ProductImageService
