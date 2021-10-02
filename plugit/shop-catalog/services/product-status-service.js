const moment = require('moment')
const { Availability } = require('./stock-service')
const { emitter, Cron } = require('#/utils')
const { db } = require('#/express')

class ProductStatusService {
	static async _update({ productId = null, categoryIsNull = false, variantId = null }) {
		let completeChecker = db
			.$rawQueryBuilder('SELECT')
			.col(
				'Product.id',
				`(
					COUNT(ProductVariant.id) > 0 AND
					SUM(ProductVariantPrice.price = 0) = 0 AND
					COUNT(ProductImage.id) > 0 AND
					Product.categoryId IS NOT NULL
				) AS ok`
			)
			.table('Product')
			.join(
				'JOIN ProductVariant ON Product.id = ProductVariant.productId',
				'JOIN ProductVariantPrice ON ProductVariant.id = ProductVariantPrice.productVariantId',
				'JOIN ProductImage ON Product.id = ProductImage.productId'
			)
			.group('Product.id')

		let stockChecker = db
			.$rawQueryBuilder('SELECT')
			.col(
				'Product.id',
				'SUM(ProductVariantStock.availability IN (:IN_STOCK,:PRE_SALE,:PRE_ORDER)) > 0 AS ok',
				{
					...Availability,
				}
			)
			.table('Product')
			.join(
				'JOIN ProductVariant ON Product.id = ProductVariant.productId',
				'JOIN ProductVariantStock ON ProductVariant.id = ProductVariantStock.productVariantId'
			)
			.group('Product.id')

		let activeChecker = db
			.$rawQueryBuilder('SELECT')
			.col(
				'Product.id',
				`Product.deletedAt IS NULL AND Product.active = 1 AND (Product.activeFrom IS NULL OR Product.activeFrom <= :today) AS ok`,
				{ today: moment().format('YYYY-MM-DD') }
			)
			.table('Product')

		await db
			.$rawQueryBuilder('UPDATE')
			.table('Product')
			.subSelectJoin('LEFT JOIN', completeChecker, 'completeChecker', 'completeChecker.id = Product.id')
			.subSelectJoin('LEFT JOIN', stockChecker, 'stockChecker', 'stockChecker.id = Product.id')
			.subSelectJoin('LEFT JOIN', activeChecker, 'activeChecker', 'activeChecker.id = Product.id')
			.set(
				'Product.complete = IFNULL(completeChecker.ok, 0)',
				'Product.shopable = IFNULL(completeChecker.ok AND activeChecker.ok, 0)',
				'Product.buyable = IFNULL(completeChecker.ok AND activeChecker.ok AND stockChecker.ok, 0)'
			)
			.if(productId, (builder) => {
				builder.where('Product.id = :productId', { productId })
			})
			.if(variantId, (builder) => {
				builder
					.join('JOIN ProductVariant ON ProductVariant.productId = Product.id')
					.where('ProductVariant.id = :variantId', { variantId })
			})
			.if(categoryIsNull, (builder) => {
				builder.where('Product.categoryId IS NULL')
			})
			.run()
	}
}

emitter.on(false, 'Product.category.SET', async ({ bulk, id, categoryId }) => {
	if (bulk) {
		if (!categoryId) {
			await ProductStatusService._update({ categoryIsNull: true })
		}
	} else {
		await ProductStatusService._update({ productId: id })
	}
})

emitter.on(false, 'ProductVariant.stock.SAVE', async ({ id }) => {
	await ProductStatusService._update({ variantId: id })
})

emitter.on(false, 'ProductVariant.price.SAVE', async ({ id, productId, bulk }) => {
	if (id) {
		await ProductStatusService._update({ variantId: id })
	} else if (productId) {
		await ProductStatusService._update({ productId })
	} else if (bulk) {
		await ProductStatusService._update({})
	}
})

emitter.on(false, 'Product.variants.SET', async ({ id, variantsIds }) => {
	await ProductStatusService._update({ productId: id })
})

emitter.on(false, 'Product.images.SET', async ({ id, variantsIds }) => {
	await ProductStatusService._update({ productId: id })
})

emitter.on(false, 'Product.SAVE', async ({ id }) => {
	await ProductStatusService._update({ productId: id })
})

emitter.on('Product.@FULL_SAVE', async ({ productId }) => {
	await ProductStatusService._update({ productId })
})

Cron.create('ProductStatusService.update', {
	title: 'Actualizar statuses de productos',
	cronTime: '0 0 0 * * *', //midnight
	onTick: async () => {
		await ProductStatusService._update({})
	},
	multipleRunning: false,
	runOnInit: true,
})

module.exports = ProductStatusService
