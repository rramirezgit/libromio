const { Router } = require('express')
const ShopService = require('./services/shop-service')
const { _try } = require('#/utils')
const { db } = require('#/express')
const { apiRouter: shopApiRouter } = require('#/shop')
const ProductService = require('./services/product-service')
const CategoryService = require('./services/category-service')

const router = Router()
shopApiRouter.use('/catalog', router)

// PRODUCTS
router.post(
	'/shop',
	_try(async (req, res, next) => {
		let { filters, brand, fromPrice, toPrice, sortBy, attrs, page, search } = req.body

		let shop = await ShopService.buildShop({
			categoriesUrlNames: filters,
			brandUrlName: brand,
			fromPrice,
			toPrice,
			sortBy,
			attrs,
			page,
			search,
		})

		res.api.data({ shop }).json()
	})
)

router.get(
	'/product/:id',
	_try(async (req, res, next) => {
		let product = await db.Product.scope('productPage').findByPk(req.params.id)

		let relatedProducts = []
		let maxRelated = 16
		let categoryFamily = await CategoryService.getFamily(product.categoryId)
		while (true) {
			let limit = maxRelated - relatedProducts.length
			if (limit == 0) break
			let category = categoryFamily.pop()
			if (!category) break
			let relatedIds = relatedProducts.map(({ id }) => id).concat(product.id)
			let { products } = await ProductService.getAll({
				categoryId: category.id,
				shopable: true,
				scope: 'card',
				limit,
				custom: (builder) => {
					builder.where('p.id NOT IN (:relatedIds)', { relatedIds })
				},
			})
			relatedProducts = relatedProducts.concat(products)
		}
		relatedProducts.sort(() => (Math.random() > 0.5 ? 1 : -1))
		res.api.data({ product, relatedProducts }).json()
	})
)
