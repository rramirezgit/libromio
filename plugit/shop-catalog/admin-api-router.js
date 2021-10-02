const { Router } = require('express')
const ProductService = require('./services/product-service')
const CategoryService = require('./services/category-service')
const BrandService = require('./services/brand-service')
const PriceConfigService = require('./services/price-config-service')
const CollectionService = require('./services/collection-service')
const { db } = require('#/express')
const { _try } = require('#/utils')
const {
	authMids: { ensurePermission },
	apiRouter: adminApiRouter,
} = require('#/admin')

const router = Router()
adminApiRouter.use('/catalog', ensurePermission('catalog'), router)

// PRODUCTS
router.get(
	'/products',
	_try(async (req, res, next) => {
		let scope = req.query.scope || 'list'

		if (req.query.ids) {
			let ids = req.query.ids.split(',')
			let products = await ProductService.getByIds(ids, { scope })
			return res.api.data({ products }).json()
		}

		let { products, pagination } = await ProductService.getAll({
			...req.query,
			ids: req.query.ids ? req.query.ids.split(',') : null,
			sortDesc: req.query.sortDesc == 'true',
			scope,
		})
		res.api.data({ products, pagination }).json()
	})
)

router.get(
	'/products/:id',
	_try(async (req, res, next) => {
		let product = await db.Product.scope('full_edit').findByPk(req.params.id)
		res.api.data({ product }).json()
	})
)

router.post(
	'/products',
	_try(async (req, res, next) => {
		delete req.body.product.id
		let apiRes = await ProductService.fullSave(req.body.product, req.files)
		res.api.set(apiRes).json()
	})
)

router.put(
	'/products/:id',
	_try(async (req, res, next) => {
		let data = req.body.product
		data.id = req.params.id
		let apiRes = await ProductService.fullSave(data, req.files)
		res.api.set(apiRes).json()
	})
)

// CATEGORIES
router.get(
	'/categories',
	_try(async (req, res, next) => {
		let { hasProducts, sortBy } = req.query
		let filters = {
			hasProducts: hasProducts && hasProducts == 'true',
			sortBy,
		}
		let categories =
			req.query.tree == 'true'
				? await CategoryService.getTree(filters)
				: await CategoryService.getAll(filters)
		res.api.data({ categories }).json()
	})
)

router.post(
	'/categories',
	_try(async (req, res, next) => {
		delete req.body.category.id
		let apiRes = await CategoryService.save(req.body.category)
		res.api.set(apiRes).json()
	})
)

router.put(
	'/categories/:id',
	_try(async (req, res, next) => {
		req.body.category.id = req.params.id
		let apiRes = await CategoryService.save(req.body.category)
		res.api.set(apiRes).json()
	})
)

router.delete(
	'/categories/:id',
	ensurePermission('catalog_full'),
	_try(async (req, res, next) => {
		let apiRes = await CategoryService.delete(req.params.id)
		res.api.set(apiRes).json()
	})
)

// BRANDS
router.get(
	'/brands',
	_try(async (req, res, next) => {
		let brands = await db.Brand.scope(req.query.scope).findAndSerializeAll()
		res.api.data({ brands }).json()
	})
)

router.post(
	'/brands',
	_try(async (req, res, next) => {
		let apiRes = await BrandService.save(req.body.brand, req.files)
		res.api.set(apiRes).json()
	})
)

router.put(
	'/brands/:id',
	_try(async (req, res, next) => {
		let apiRes = await BrandService.save(req.params.id, req.body.brand, req.files)
		res.api.set(apiRes).json()
	})
)
router.delete(
	'/brands/:id',
	ensurePermission('catalog_full'),
	_try(async (req, res, next) => {
		let apiRes = await BrandService.delete(req.params.id)
		res.api.set(apiRes).json()
	})
)

// TAGS

router.get(
	'/tags',
	_try(async (req, res, next) => {
		let tags = await db.Tag.findAndSerializeAll()
		res.api.data({ tags }).json()
	})
)

// ATTRS
router.get(
	'/attr-keys',
	_try(async (req, res, next) => {
		let attrKeys = await db.AttrKey.scope(req.query.scope).findAndSerializeAll()
		res.api.data({ attrKeys }).json()
	})
)

// PRICES CONFIGS
router.get(
	'/price-config',
	_try(async (req, res, next) => {
		let pricesConfigs = await PriceConfigService.getAll({
			editable: req.query.editable == 'true',
			scope: req.query.scope,
		})
		res.api.data({ pricesConfigs }).json()
	})
)

router.post(
	'/price-config',
	ensurePermission('catalog_full'),
	_try(async (req, res, next) => {
		delete req.body.priceConfig.id
		let apiRes = await PriceConfigService.save(req.body.priceConfig)
		res.api.set(apiRes).json()
	})
)

router.put(
	'/price-config/:id',
	ensurePermission('catalog_full'),
	_try(async (req, res, next) => {
		req.body.priceConfig.id = req.params.id
		let apiRes = await PriceConfigService.save(req.body.priceConfig)
		res.api.set(apiRes).json()
	})
)

router.delete(
	'/price-config/:id',
	_try(async (req, res, next) => {
		let apiRes = await PriceConfigService.delete(req.params.id)
		res.api.set(apiRes).json()
	})
)

// COLLECTIONS
router.get(
	'/collection',
	_try(async (req, res, next) => {
		let collections = await CollectionService.getAll()
		res.api.data({ collections }).json()
	})
)

router.post(
	'/collection',
	ensurePermission('catalog_full'),
	_try(async (req, res, next) => {
		delete req.body.collection.id
		let apiRes = await CollectionService.save(req.body.collection)
		res.api.set(apiRes).json()
	})
)

router.put(
	'/collection/:id',
	ensurePermission('catalog_full'),
	_try(async (req, res, next) => {
		req.body.collection.id = req.params.id
		let apiRes = await CollectionService.save(req.body.collection)
		res.api.set(apiRes).json()
	})
)

router.delete(
	'/collection/:id',
	ensurePermission('catalog_full'),
	_try(async (req, res, next) => {
		let apiRes = await CollectionService.delete(req.params.id)
		res.api.set(apiRes).json()
	})
)
