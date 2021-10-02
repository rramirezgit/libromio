const _ = require('lodash')
const { Op } = require('sequelize')
const { shopAllKeyword } = require('../index')
const CategoryService = require('./category-service')
const ProductService = require('./product-service')
const CollectionService = require('./collection-service')
const { db } = require('#/express')
const { ConfigService } = require('#/admin')

class ShopService {
	/**
	 * @param {{
	 * 	categoriesUrlNames?: string[],
	 * 	brandUrlName?: string,
	 * 	fromPrice?: number,
	 * 	toPrice?: number,
	 * 	sortBy?: string,
	 * 	search?: string,
	 * 	attrs?: {},
	 * 	page?: number
	 * }} rawFilters
	 * @returns { false | {
	 * 	products: Array<{}>,
	 * 	pagination: {},
	 * 	possibleFilters: {},
	 * 	meta: { title: string, description: string, h1: string},
	 * 	removalChips: {},
	 * 	breadcrumbs: Array<{text: string, value: string}>,
	 * 	context: {title: string, imageUrl: string}
	 * }}
	 */
	static async buildShop(rawFilters = {}) {
		let shopFilters = await this.__processRawFilters(rawFilters)
		if (shopFilters === false) return false

		let { products, pagination } = await ProductService.getAll(this.__makeProductsFilters(shopFilters))
		let possibleFilters = await this.__makePossibleFilters(shopFilters)
		let context = this.__makeContext(shopFilters)
		let meta = this.__makeMetadata(shopFilters)
		let breadcrumbs = this.__makeBreadcrumbs(shopFilters)
		let removalChips = this.__makeRemovalChips(shopFilters)
		return {
			products,
			pagination,
			possibleFilters,
			context,
			meta,
			removalChips,
			breadcrumbs,
		}
	}

	static async __processRawFilters(rawFilters) {
		let shopFilters = {}

		let { categoriesUrlNames } = rawFilters
		if (!categoriesUrlNames || !categoriesUrlNames.length) {
			return false
		}

		if (categoriesUrlNames && categoriesUrlNames[0] == shopAllKeyword) {
			categoriesUrlNames.shift()
			if (categoriesUrlNames.length) {
				return false
			}
		}

		shopFilters.categoryFamily = []

		if (categoriesUrlNames && categoriesUrlNames.length) {
			categoriesUrlNames = categoriesUrlNames.map((str) => str.trim()).filter((str) => !!str)

			let catTree = await CategoryService.getTree()
			for (let [i, urlName] of categoriesUrlNames.entries()) {
				let cat = catTree.find((cat) => cat.urlName == urlName)
				if (cat) {
					shopFilters.category = cat
					shopFilters.categoryFamily.push(cat)
					catTree = cat.children
				} else if (i == 0) {
					let activeShopCollectionsData = await ConfigService.getActiveData('ShopCollections')
					let shopCollection = activeShopCollectionsData.find((data) =>
						data.urlKeywords.includes(urlName)
					)
					if (shopCollection) {
						let collection = await CollectionService.get(shopCollection.collectionId)
						if (!collection) return false
						shopFilters.collection = collection
						shopFilters.shopCollection = shopCollection
					} else {
						return false
					}
				} else {
					return false
				}
			}
		}

		let { brandUrlName } = rawFilters
		if (brandUrlName) {
			let brand = await db.Brand.findOne({
				where: { urlName: brandUrlName },
			})
			if (!brand) return false
			shopFilters.brand = brand
		}

		let { fromPrice, toPrice } = rawFilters
		if (toPrice !== undefined) {
			if (isNaN(toPrice)) return false
			toPrice = Number(toPrice)
			if (toPrice <= 0) return false
			shopFilters.toPrice = toPrice
		}

		if (fromPrice !== undefined) {
			if (isNaN(fromPrice)) return false
			fromPrice = Number(fromPrice)
			if (toPrice && toPrice < fromPrice) return false
			else if (fromPrice <= 0) fromPrice = null
			else shopFilters.fromPrice = fromPrice
		}

		let { sortBy } = rawFilters
		if (sortBy) {
			if (sortBy == 'mayor-precio' || sortBy == 'menor-precio') {
				shopFilters.sortBy = 'price'
				shopFilters.sortDesc = sortBy == 'mayor-precio'
			} else {
				return false
			}
		}

		let { attrs } = rawFilters
		if (attrs) {
			let builder = db
				.$queryBuilder()
				.join('values')
				.where({ shopFilter: true })
				.where({
					[Op.or]: [
						...Object.entries(attrs).map(([k, v]) => ({
							[Op.and]: [db.$where(db.$col('AttrKey.urlK'), k), db.$where(db.$col('values.urlV'), v)],
						})),
					],
				})

			let attrKeys = await db.AttrKey.findAll(builder.get())
			if (attrKeys.length !== Object.keys(attrs).length) return false
			shopFilters.attrs = attrKeys.map((attrKey) => ({
				kId: attrKey.id,
				k: attrKey.k,
				urlK: attrKey.urlK,
				vId: attrKey.values[0].id,
				v: attrKey.values[0].v,
				urlV: attrKey.values[0].urlV,
			}))
		}

		let { page } = rawFilters
		shopFilters.page = isNaN(page) || page < 1 ? 1 : parseInt(page)

		shopFilters.search = rawFilters.search?.trim()
		return shopFilters
	}

	/**
	 * @returns {ProductService.ProductsFilters}
	 */
	static __makeProductsFilters(shopFilters) {
		return {
			search: shopFilters.search,
			categoryId: shopFilters.category?.id,
			collectionId: shopFilters.shopCollection?.collectionId,
			brandId: shopFilters.brand?.id,
			fromPrice: shopFilters.fromPrice,
			toPrice: shopFilters.toPrice,
			sortBy: shopFilters.sortBy,
			sortDesc: shopFilters.sortDesc,
			page: shopFilters.page,
			attrs: shopFilters.attrs,
			limit: 18,
			scope: 'card',
			shopable: true,
		}
	}

	static async __makePossibleFilters(shopFilters) {
		let possibleFilters = {}

		let productsFilters = this.__makeProductsFilters(shopFilters)
		let productsBuilder = () => {
			return ProductService.getFiltersRawQueryBuilder(productsFilters, false)
		}

		// SORT
		let { sortBy, sortDesc } = shopFilters
		possibleFilters.sortBy = []
		if (sortBy != 'price' || sortDesc) {
			possibleFilters.sortBy.push({
				text: 'Menor precio',
				value: 'menor-precio',
			})
		}
		if (sortBy != 'price' || !sortDesc) {
			possibleFilters.sortBy.push({
				text: 'Mayor precio',
				value: 'mayor-precio',
			})
		}

		// SHOP COLLECTION
		let { shopCollection } = shopFilters
		if (!shopCollection) {
			let filtrableCollections = (await ConfigService.getActiveData('ShopCollections')).filter(
				(sc) => sc.showShopFilter
			)
			if (filtrableCollections.length) {
				let collIds = _.uniq(filtrableCollections.map((sc) => sc.collectionId))
				let [rows] = await db
					.$rawQueryBuilder('SELECT')
					.col('chp.collectionId', 'COUNT(DISTINCT(Product.id)) as count')
					.table('Product')
					.join(
						'JOIN CollectionHasProduct chp ON chp.productId = Product.id AND chp.collectionId IN (:collIds)',
						{ collIds }
					)
					.subSelectJoin('JOIN', productsBuilder(), 'sub', 'sub.id = Product.id')
					.group('chp.collectionId')
					.run()

				possibleFilters.collection = rows.map((row) => {
					let shopCollection = filtrableCollections.find((sc) => sc.collectionId == row.collectionId)
					return {
						text: shopCollection.title,
						value: shopCollection.urlKeywords[0],
						color: shopCollection.shopFilterColor,
						position: shopCollection.shopFilterPosition,
						count: row.count,
					}
				})
				possibleFilters.collection.sort((a, b) => {
					let pa = a.position
					let pb = b.position
					if (pa === pb) return pa.text > pb.text ? 1 : -1
					return !pa ? 1 : !pb ? -1 : pa - pb
				})
			}
		}

		// CATEGORY
		let { category } = shopFilters
		if (!category || category.children.length) {
			let [rows] = await db
				.$rawQueryBuilder('SELECT')
				.col('Category.name', 'Category.urlName', 'COUNT(DISTINCT(Product.id)) as count')
				.table('Product')
				.join('JOIN ProductHasCategory phc ON phc.productId = Product.id')
				.join('JOIN Category ON Category.id = phc.categoryId')
				.subSelectJoin('JOIN', productsBuilder(), 'sub', 'sub.id = Product.id')
				.where(!!category, 'Category.parentId = :catParentId', { catParentId: category?.id })
				.where(!category, 'Category.pos = 1')
				.group('Category.id')
				.run()

			possibleFilters.category = rows.map((row) => ({
				text: row.name,
				value: row.urlName,
				count: row.count,
			}))
		}

		// BRAND
		let { brand } = shopFilters
		if (!brand) {
			let [rows] = await db
				.$rawQueryBuilder('SELECT')
				.col('Brand.name', 'Brand.urlName', 'COUNT(DISTINCT(Product.id)) as count')
				.table('Product')
				.join('JOIN Brand ON Brand.id = Product.brandId')
				.subSelectJoin('JOIN', productsBuilder(), 'sub', 'sub.id = Product.id')
				.group('Brand.id')
				.run()

			possibleFilters.brand = rows.map((row) => ({
				text: row.name,
				value: row.urlName,
				count: row.count,
			}))
		}

		// ATTRS
		let { attrs } = shopFilters
		let currentKeysIds = attrs ? attrs.map((attr) => attr.kId) : null
		possibleFilters.attrsGroups = []

		// prettier-ignore
		let unionBuilders = [1,2].map(i => 
			db
				.$rawQueryBuilder('SELECT')
				.col('AttrKey.k', 'AttrKey.urlK', 'AttrVal.v', 'AttrVal.urlV', 'AttrVal.id', 'Product.id AS pid')
				.table('Product')
				.join(i==1, 'JOIN ProductVariant ON ProductVariant.productId = Product.id')
				.join(i==1, 'JOIN ProductVariantAttr mid ON mid.productVariantId = ProductVariant.id')
				.join(i==2, 'JOIN ProductHasAttr mid ON mid.productId = Product.id')
				.join('JOIN AttrVal ON AttrVal.id = mid.attrValId')
				.join('JOIN AttrKey ON AttrKey.id = AttrVal.attrKeyId AND AttrKey.shopFilter = true')
				.where(!!currentKeysIds, 'AttrKey.id NOT IN (:currentKeysIds)', {currentKeysIds})
		)

		let attrsBuilder = db.$rawQueryBuilder('SELECT')
		let [rows] = await attrsBuilder
			.col('attrsUnion.*', 'COUNT(DISTINCT(Product.id)) as count')
			.table('Product')
			.subSelectJoin('JOIN', productsBuilder(), 'sub', 'sub.id = Product.id')
			.join(`JOIN (${attrsBuilder.$union(...unionBuilders)}) attrsUnion ON attrsUnion.pid = Product.id`)
			.group('attrsUnion.id')
			.run()

		for (let row of rows) {
			let { k: title, v: text, urlK, urlV } = row
			let data = possibleFilters.attrsGroups.find((data) => data.title == title)
			if (!data) {
				data = { title, items: [] }
				possibleFilters.attrsGroups.push(data)
			}
			let item = data.items.find((item) => item.text == text)
			if (!item) {
				item = { text, value: [urlK, urlV], count: 0 }
				data.items.push(item)
			}
			item.count += row.count
		}

		return possibleFilters
	}

	static __makeRemovalChips(shopFilters) {
		let removalChips = []

		let { search } = shopFilters
		if (search) {
			let truncSearch = search.length > 20 ? search.slice(0, 17) + '...' : search
			removalChips.push({
				type: 'search',
				text: `Búsqueda: ${truncSearch}`,
			})
		}

		let { sortBy, sortDesc } = shopFilters
		if (sortBy == 'price') {
			removalChips.push({
				type: 'sortBy',
				text: sortDesc ? 'Mayor precio' : 'Menor precio',
			})
		}

		let { shopCollection } = shopFilters
		if (shopCollection) {
			removalChips.push({
				type: 'collection',
				text: shopCollection.title,
			})
		}

		let { brand } = shopFilters
		if (brand) {
			removalChips.push({
				type: 'brand',
				text: brand.name,
			})
		}

		let { attrs } = shopFilters
		if (attrs) {
			attrs.forEach((attr) => {
				removalChips.push({
					type: 'attr',
					text: `${attr.k}: ${attr.v}`,
					value: [attr.urlK, attr.urlV],
				})
			})
		}

		return removalChips
	}

	static __makeBreadcrumbs(shopFilters) {
		let breadcrumbs = []
		let { category, categoryFamily } = shopFilters
		if (category) {
			breadcrumbs.push({
				text: 'Todos los productos',
				value: [],
			})

			if (categoryFamily.length > 1) {
				let value = []
				for (let cat of categoryFamily) {
					if (cat.pos == category.pos) break
					value.push(cat.urlName)
					breadcrumbs.push({ text: cat.name, value: [...value] })
				}
			}
			// } else {
			// 	breadcrumbs.push({
			// 		text: 'Todos los productos',
			// 		value: [shopAllKeyword],
			// 	})
			// }
		}
		return breadcrumbs
	}

	static __makeContext(shopFilters) {
		let title = []
		let imageUrl = null
		let imageMobileUrl = null
		let { shopCollection, category, brand } = shopFilters

		if (shopCollection?.showShopImage) {
			imageUrl = shopCollection.shopImage
			imageMobileUrl = shopCollection.shopImageMobile
		}

		if (shopCollection) {
			title.push(shopCollection.title)
			if (category || brand) title.push('/')
			if (category) title.push(category.name)
			if (brand) {
				if (category) title.push('de')
				title.push(brand.name)
			}
		} else {
			title.push(category?.name || 'Todos los Productos')
			if (brand) title.push(`de ${brand.name}`)
		}

		return {
			title: title.join(' '),
			imageUrl,
			imageMobileUrl,
		}
	}

	static __makeMetadata(shopFilters) {
		return {}
	}
}

module.exports = ShopService
