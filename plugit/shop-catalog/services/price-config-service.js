const _ = require('lodash')
const { db } = require('#/express')
const { ApiRes, emitter, Cache } = require('#/utils')

class PriceConfigService {
	static get DEFAULT_KEYNAME() {
		return 'default'
	}

	static async getAll(
		/*{
			editable,
			scope
		}*/
		options = {}
	) {
		let all = await Cache.get('pricesConfigs', options.scope || 'full')
		return all.filter((priceConfig) => {
			if (options.editable) {
				if (priceConfig.relativeToId) return false
			}
			return true
		})
	}

	static async get(id) {
		if (isNaN(id)) {
			let keyname = typeof id == 'string' ? id : id.keyname
			return await (await this.getAll()).find((priceConfig) => priceConfig.keyname == keyname)
		} else {
			return await (await this.getAll()).find((priceConfig) => priceConfig.id == id)
		}
	}

	static async getDefault() {
		return await this.get(this.DEFAULT_KEYNAME)
	}

	/**
	 * @param {{
	 * 	id?: number,
	 * 	keyname: string,
	 * 	relativeToId: number,
	 * 	relativePct: number,
	 * 	discounts?: Array<{
	 * 		displayName: string,
	 * 		discountPct: number,
	 * 		priority?: number,
	 * 		collectionId?: number
	 * 	}>
	 * }} data
	 */
	static async save(data = {}) {
		let isNew = !data.id
		let apiRes = ApiRes()

		await db.$transaction(async (t) => {
			let priceConfig = isNew
				? db.PriceConfig.build()
				: await db.PriceConfig.findByPk(data.id, { lock: true })

			if (!priceConfig) {
				apiRes.error('La configuración de precios es inexistente o ha sido eliminada')
				throw null
			}

			let isDefault = priceConfig.keyname == this.DEFAULT_KEYNAME
			let results = await priceConfig.setAndValidate({
				keyname: isDefault ? priceConfig.keyname : data.keyname,
				relativeToId: isDefault ? null : data.relativeToId,
				relativePct: data.relativePct || 0,
			})
			apiRes.validation(results, 'priceConfig')

			let currentDiscounts = priceConfig.discounts || []
			priceConfig.discounts = []
			data.discounts = data.discounts || []
			for (let [i, discountData] of data.discounts.entries()) {
				let discount =
					discountData.id && currentDiscounts.find((discount) => discount.id == discountData.id)
				if (!discount) discount = db.PriceConfigDiscount.build()
				let results = await discount.setAndValidate({
					displayName: discountData.displayName,
					discountPct: discountData.discountPct,
					priority: discountData.priority || 0,
					collectionId: discountData.collectionId,
				})
				apiRes.validation(results, `priceConfig.discounts.${i}`)
				priceConfig.discounts.push(discount)
			}

			if (apiRes.hasErrors()) {
				throw null
			}

			await priceConfig.save()
			apiRes.data({ priceConfigId: priceConfig.id })

			for (let discount of priceConfig.discounts) await discount.save()
			await priceConfig.setDiscounts(priceConfig.discounts, { individualHooks: true })

			Cache.delete('pricesConfigs')

			let subEvent = isNew ? 'CREATE' : 'UPDATE'
			await emitter.emit('PriceConfig.SAVE', { id: priceConfig.id, subEvent, t })
		})

		return apiRes
	}

	static async delete(id) {
		let priceConfig = await db.PriceConfig.findByPk(id)
		if (priceConfig) {
			await db.$transaction(async (t) => {
				const deleteEvent = emitter.managedEvent('PriceConfig.DELETE')
				await emitter.emit('PriceConfig.BEFORE_DELETE', { id: priceConfig.id, deleteEvent, t })
				await priceConfig.destroy()
				Cache.delete('pricesConfigs')
				await deleteEvent.emit({ id: priceConfig.id, t })
			})
		}
		return ApiRes()
	}

	static async _createDefault() {
		return await db.PriceConfig.create({
			keyname: this.DEFAULT_KEYNAME,
			relativePct: 0,
		})
	}
}

Cache.preset('pricesConfigs', {
	data: async (scope) => {
		let items = await db.PriceConfig.scope(scope).findAll()
		if (!items.length) {
			items = [await PriceConfigService._createDefault()]
		}
		return items
	},
	key: (scope) => scope,
	clone: true,
})

emitter.on('Collection.BEFORE_DELETE', async ({ id, deleteEvent, t }) => {
	let discounts = await db.PriceConfigDiscount.findAll({ where: { collectionId: id } })
	if (!discounts.length) return
	deleteEvent.onEmit(async () => {
		Cache.delete('pricesConfigs')
		let priceConfigsIds = _.uniq(discounts.map((discount) => discount.priceConfigId))
		for (let priceConfigId of priceConfigsIds) {
			await emitter.emit('PriceConfig.SAVE', { id: priceConfigId, subEvent: 'UPDATE', t })
		}
	})
})

module.exports = PriceConfigService
