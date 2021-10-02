const _ = require('lodash')
const moment = require('moment')
const Availability = require('./stock-availability')
const { db } = require('#/express')
const { ApiRes, emitter } = require('#/utils')

class StockService {
	/**
	 * @param {{
	 * 	variantId: string,
	 * 	managedEvent: Object,
	 * 	qty?: number,
	 * 	deferredDelivery?: number,
	 * 	availabilityDate?: (string|Date),
	 * 	maxBuyableQty?: number,
	 * 	infiniteQty?: boolean,
	 * }} data
	 */
	static async save(data) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let { variantId, managedEvent } = data
			let isNew = !variantId
			let stock = isNew
				? db.ProductVariantStock.build()
				: await db.ProductVariantStock.findOne({
						where: { productVariantId: variantId },
						lock: true,
				  })

			let def = {
				qty: isNew ? 0 : undefined,
				deferredDelivery: undefined,
				availabilityDate: undefined,
				maxBuyableQty: undefined,
				infiniteQty: isNew ? false : undefined,
			}
			data = _.pickBy(_.defaults(data, def), (v, k) => k in def && (isNew || v !== undefined))

			let results = await stock.setAndValidate(data)
			if (results !== true) {
				apiRes.validation(results, 'stock')
				throw null
			}

			if (isNew) stock.availability = Availability.OUT_OF_STOCK
			apiRes.data({ stock })

			let fn = async ({ variantId }) => {
				await stock.set({ productVariantId: variantId }).save()
				await this._updateAvailability({ variantId })
				await emitter.emit('ProductVariant.stock.SAVE', { id: variantId, t })
			}

			managedEvent ? await managedEvent.onEmit(fn) : await fn({ variantId })
		})
		return apiRes
	}

	static async setQty(variantId, qty) {
		if (isNaN(qty) || qty < 0) return
		await db
			.$rawQueryBuilder('UPDATE')
			.table('ProductVariantStock')
			.set('qty = :qty', { qty })
			.where('productVariantId = :variantId', { variantId })
			.run()
		await this._updateAvailability({ variantId })
		emitter.emit('ProductVariant.stock.SAVE', { id: variantId })
	}

	static async addQty(variantId, qty) {
		if (isNaN(qty) || qty <= 0) return
		await db
			.$rawQueryBuilder('UPDATE')
			.table('ProductVariantStock')
			.set('qty = qty + :qty', { qty })
			.where('productVariantId = :variantId', { variantId })
			.run()
		await this._updateAvailability({ variantId })
		emitter.emit('ProductVariant.stock.SAVE', { id: variantId })
	}

	static async subtractQty(variantId, qty) {
		if (isNaN(qty) || qty <= 0) return
		await db
			.$rawQueryBuilder('UPDATE')
			.table('ProductVariantStock')
			.set('qty = GREATEST(qty - :qty, 0)', { qty })
			.where('productVariantId = :variantId', { variantId })
			.run()
		await this._updateAvailability({ variantId })
		emitter.emit('ProductVariant.stock.SAVE', { id: variantId })
	}

	static async _updateAvailability({ productId, variantId }) {
		await db
			.$rawQueryBuilder('UPDATE')
			.table('ProductVariantStock')
			.set(
				`
				availability = 
					IF(infiniteQty = 0 AND qty = 0, :OUT_OF_STOCK, 
						IF(availabilityDate IS NOT NULL AND availabilityDate > :today, :PRE_SALE,
							IF(deferredDelivery IS NOT NULL, :PRE_ORDER, :IN_STOCK
					)))
			`,
				{ ...Availability, today: moment().format('YYYY-MM-DD') }
			)
			.if(productId, (builder) => {
				builder
					.join('JOIN ProductVariant ON ProductVariantStock.productVariantId = ProductVariant.id')
					.where('ProductVariant.productId = :productId', { productId })
			})
			.if(variantId, (builder) => {
				builder.where('ProductVariantStock.productVariantId = :variantId', { variantId })
			})
			.run()
	}

	static get Availability() {
		return Availability
	}
}

module.exports = StockService
