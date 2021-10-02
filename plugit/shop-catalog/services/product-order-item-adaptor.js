const { db } = require('#/express')
const { OrderItemAdaptor } = require('#/shop-order')
const PriceConfigService = require('./price-config-service')
const Availability = require('./stock-availability')
const StockService = require('./stock-service')
const { emitter } = require('#/utils')

OrderItemAdaptor.register('product', {
	refItem: async ({ refId, context }) => {
		let builder = db
			.$queryBuilder()
			.join('mainImage')
			.join('variants', { where: { id: refId }, required: true })
			.join('variants.stock')
			.join('variants.attrs.attrKey')
			.join('variants.pvPrice.priceConfig', { where: { keyname: PriceConfigService.DEFAULT_KEYNAME } })
			.join('variants.pvPrice.discountConfig')
			.set({ subQuery: false })

		if (context?.orderDiscount?.discountConfig?.collectionId) {
			builder.join('collections')
		}

		let products = await db.Product.findAll(builder.get())
		return products[0]
	},
	orderItemData: ({ refItem: product, qty, context }) => {
		if (!product.buyable) return null

		let { name, mainImage, unitMetric } = product
		let variant = product.variants[0]
		let { sku, size, weight, type, digital } = variant
		let { discountConfig, discountPct, extraDiscountPct, prevPrice, price } = variant.pvPrice

		let variantName = null
		if (!product.hasUniqueVariant) {
			variantName = variant.attrs.map((attr) => `${attr.attrKey.k}: ${attr.v}`).join(' | ')
		}

		let initPrice = prevPrice || price

		let discountName = []
		if (discountConfig) discountName.push(discountConfig.displayName)
		if (extraDiscountPct) discountName.push('Descuento especial')
		discountName = discountName.join(' + ')

		let reachedByOrderDiscount = false
		if (context?.orderDiscount?.discountConfig) {
			let { collectionId } = context.orderDiscount.discountConfig
			if (!collectionId || product.collections.find(({ id }) => id == collectionId)) {
				reachedByOrderDiscount = true
			}
		}

		if (type == 'digital') qty = 1
		qty = Math.max(qty, 1)

		return {
			sku,
			name,
			variantName,
			initPrice,
			discountPct,
			discountName,
			reachedByOrderDiscount,
			image: mainImage.squareUrl,
			qty,
			size,
			weight,
			unitMetric,
			type,
			digital,
		}
	},
	validateQty: ({ refItem: product, qty }) => {
		let { stock, type } = product.variants[0]

		if (stock.availability == Availability.OUT_OF_STOCK) {
			return false
		}

		if (type == 'digital') return 1

		if (stock.maxBuyableQty && stock.maxBuyableQty >= 1) {
			qty = Math.min(qty, stock.maxBuyableQty)
		}
		if (!stock.infiniteQty) {
			if (stock.qty <= 0) return false
			qty = Math.min(qty, stock.qty)
		}
		return qty
	},
	cartData: ({ refItem: product }) => {
		let {
			stock: { qty, infiniteQty, maxBuyableQty },
		} = product.variants[0]
		let maxQty = null
		if (maxBuyableQty && maxBuyableQty >= 1) {
			maxQty = maxBuyableQty
		}
		if (!infiniteQty && qty >= 1) {
			maxQty = maxQty ? Math.min(maxQty, qty) : qty
		}

		return {
			productId: product.id,
			urlName: product.urlName,
			variantId: product.hasUniqueVariant ? null : product.variants[0].id,
			maxQty,
		}
	},
	onOrderConfirmed: async (orderMng, orderItem, { refItem: product }) => {
		let { id: variantId } = product.variants[0]
		await StockService.subtractQty(variantId, orderItem.qty)
	},
})

emitter.on('Order.MAIN_STATUS', async ({ orderMng, mainStatus }) => {
	let items = orderMng.items.filter((item) => item.refType == 'product')
	for (let item of items) {
		if (mainStatus == 'confirmed') {
			await StockService.subtractQty(item.refId, item.qty)
		}
		if (mainStatus == 'canceled') {
			await StockService.addQty(item.refId, item.qty)
		}
	}
})
