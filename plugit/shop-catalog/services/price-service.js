const _ = require('lodash')
const { db } = require('#/express')
const { emitter, parseNum } = require('#/utils')
const PriceConfigService = require('./price-config-service')

class PriceService {
	/**
	 * @param {string} variantId
	 * @param {number} priceConfigId
	 * @param {number} basePrice
	 * @param {number} extraDiscountPct
	 */
	static async update(variantId, priceConfigId, basePrice, extraDiscountPct) {
		await this.__updatePrices(priceConfigId, { variantId, basePrice, extraDiscountPct })
	}

	static async _updateAllByPriceConfig(priceConfigId) {
		await this.__updatePrices(priceConfigId)
	}

	static async _updateProductByPriceConfig(productId, priceConfigId) {
		await this.__updatePrices(priceConfigId, { productId })
	}

	static async _createPrices(by, id) {
		let builder = db
			.$rawQueryBuilder('INSERT')
			.table('ProductVariantPrice')
			.col(
				'productVariantId, priceConfigId, basePrice, modifPrice, prevPrice, price, configDiscountPct, extraDiscountPct, discountPct'
			)

		let subQuery = db
			.$rawQueryBuilder('SELECT')
			.table('ProductVariant', 'PriceConfig')
			.col('ProductVariant.id', 'PriceConfig.id', 0, 0, 0, 0, 0, 0, 0)
			.where(by == 'PriceConfig', 'PriceConfig.id = :id', { id })
			.where(by == 'ProductVariant', 'ProductVariant.id = :id', { id })

		builder.insertSelect(...subQuery.export())
		await builder.run()
	}

	static async __updatePrices(priceConfigId, opts = {}, _recursiveRelativeConfigCall = false) {
		await db.$transaction(async (t) => {
			let { productId, variantId, basePrice, extraDiscountPct } = opts

			let priceConfig
			if (_recursiveRelativeConfigCall) {
				priceConfig = priceConfigId
			} else {
				priceConfig = await db.PriceConfig.scope('full').findByPk(priceConfigId)
			}
			if (!priceConfig) return

			await this.__updateBasePrices(priceConfig, { productId, variantId, basePrice })
			await this.__updateDiscountsAndFinalPrice(priceConfig, { productId, variantId, extraDiscountPct })
			//await this.__updateMinPrices(priceConfig, { productId, variantId })

			await emitter.emit('ProductVariant.price.SAVE', {
				id: variantId,
				productId,
				bulk: !variantId && !productId,
				priceConfigId,
				t,
			})

			let relativeConfigs = await db.PriceConfig.scope('full').findAll({
				where: { relativeToId: priceConfig.id },
			})
			for (let relativeConfig of relativeConfigs) {
				await this.__updatePrices(relativeConfig, { productId, variantId }, true)
			}
		})
	}

	static async __updateBasePrices(priceConfig, opts = {}) {
		let { relativeToId, relativePct, id: priceConfigId } = priceConfig
		let { productId, variantId, basePrice } = opts
		let basePriceModifier = relativePct / 100 + 1

		if (relativeToId) {
			basePrice = 'pvp2.modifPrice'
		} else if (variantId || productId) {
			basePrice = parseNum(basePrice, 'pvp.basePrice')
		} else {
			basePrice = 'pvp.basePrice'
		}

		await db
			.$rawQueryBuilder('UPDATE')
			.table('ProductVariantPrice pvp')
			.join(
				!!relativeToId,
				'JOIN ProductVariantPrice pvp2 ON pvp.productVariantId = pvp2.productVariantId AND pvp2.priceConfigId = :relativeToId',
				{ relativeToId }
			)
			.join(!!productId, 'JOIN ProductVariant pv ON pv.id = pvp.productVariantId')
			.set(`pvp.basePrice = ${basePrice}`)
			.set(`pvp.modifPrice = ${basePrice} * :basePriceModifier`, { basePriceModifier })
			.where(!!productId, `pv.productId = :productId`, { productId })
			.where(!!variantId, `pvp.productVariantId = :variantId`, { variantId })
			.where(`pvp.priceConfigId = :priceConfigId`, { priceConfigId })
			.run()
	}

	static async __updateDiscountsAndFinalPrice(priceConfig, opts = {}) {
		let { id: priceConfigId, discounts } = priceConfig
		let { variantId, productId, extraDiscountPct, discountConfig } = opts
		let discountConfigId = discountConfig?.id || null
		let configDiscountPct = discountConfig?.discountPct || 0
		let collectionId = discountConfig?.collectionId

		let builder = db
			.$rawQueryBuilder('UPDATE')
			.table('ProductVariantPrice pvp')
			.join('JOIN ProductVariant pv ON pvp.productVariantId = pv.id')
			.join(
				!!collectionId,
				'JOIN CollectionHasProduct chp ON pv.productId = chp.productId AND chp.collectionId = :collectionId',
				{ collectionId }
			)
			.set('pvp.priceConfigDiscountId = :discountConfigId', { discountConfigId })
			.set('pvp.configDiscountPct = :configDiscountPct', { configDiscountPct })

		extraDiscountPct = parseNum(extraDiscountPct, 'pvp.extraDiscountPct')
		builder.set(`pvp.extraDiscountPct = ${extraDiscountPct}`)

		let dsum = `:configDiscountPct + ${extraDiscountPct}`
		let prevPriceSql = `
			IF(${dsum} = 0, 0, 
				IF(${dsum} > 0, pvp.modifPrice, 
					ROUND(pvp.modifPrice / ( ((${dsum})/100) + 1 ), 2)
			))`
		let priceSql = `
			IF(${dsum} <= 0, pvp.modifPrice, 
				GREATEST(0.01, ROUND(pvp.modifPrice * ( 1 - ((${dsum})/100) ), 2) )
			)`
		builder
			.set(`pvp.discountPct = ABS( LEAST(99.99,${dsum}) )`)
			.set(`pvp.prevPrice = ${prevPriceSql}`)
			.set(`pvp.price = ${priceSql}`)
			.where(!!productId, `pv.productId = :productId`, { productId })
			.where(!!variantId, `pv.id = :variantId`, { variantId })
			.where(`pvp.priceConfigId = :priceConfigId`, { priceConfigId })
			.run()

		if (!discountConfig && discounts && discounts.length) {
			discounts.sort((a, b) => a.priority - b.priority)
			for (let discountConfig of discounts) {
				await this.__updateDiscountsAndFinalPrice(priceConfig, { variantId, productId, discountConfig })
			}
		}
	}

	static async __updateMinPrices(priceConfig, opts = {}) {
		let { id: priceConfigId } = priceConfig
		let { productId, variantId } = opts
		let subSelect = db
			.$rawQueryBuilder('SELECT')
			.col('ss.id')
			.table(
				`(
				${db
					.$rawQueryBuilder('SELECT')
					.col('_pvp.id', '_pvp.price', '_pv.productId')
					.table('ProductVariantPrice _pvp')
					.join('JOIN ProductVariant _pv ON _pvp.productVariantId = _pv.id')
					.where(`_pvp.priceConfigId = :priceConfigId`)
					.make()}
			) ss`
			)
			.where('ss.productId = pv.productId')
			.order('ss.price ASC')
			.limit(1)

		let builder = db
			.$rawQueryBuilder('UPDATE')
			.table('ProductVariantPrice pvp')
			.join('JOIN ProductVariant pv ON pvp.productVariantId = pv.id')
			.set(`pvp.isMinPrice = IFNULL(pvp.id = (${subSelect.make()}), 0)`)

		if (productId) {
			builder.where('pv.productId = :productId', { productId })
		} else if (variantId) {
			builder
				.join('JOIN ProductVariant pv2 ON pv.productId = pv2.productId')
				.where('pv2.id = :variantId', { variantId })
		}

		await builder.where(`pvp.priceConfigId = :priceConfigId`, { priceConfigId }).run()
	}
}

emitter.on('PriceConfig.SAVE', async ({ id, subEvent }) => {
	if (subEvent == 'CREATE') {
		await PriceService._createPrices('PriceConfig', id)
	}
	await PriceService._updateAllByPriceConfig(id)
})

emitter.on('Collection.products.SET', async ({ id, productId, t }) => {
	let discounts = await db.PriceConfigDiscount.findAll({ where: { collectionId: id } })
	let priceConfigsIds = _.uniq(discounts.map((discount) => discount.priceConfigId))
	for (let priceConfigId of priceConfigsIds) {
		if (productId) {
			await PriceService._updateProductByPriceConfig(productId, priceConfigId)
		} else {
			await PriceService._updateAllByPriceConfig(priceConfigId)
		}
	}
})

emitter.on('ProductVariant.SAVE', async ({ id, subEvent, t }) => {
	if (subEvent == 'CREATE') {
		await PriceService._createPrices('ProductVariant', id)
	}
})

module.exports = PriceService
