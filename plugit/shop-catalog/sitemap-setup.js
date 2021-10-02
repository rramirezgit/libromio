const { SitemapMaker } = require('#/utils')
const { db } = require('#/express')
const { ConfigService } = require('#/admin')
const CategoryService = require('./services/category-service')
const ShopService = require('./services/shop-service')

SitemapMaker.builder('shop-catalog', {
	urls: async () => {
		let rows = await db.Product.findAll(
			db
				.$queryBuilder()
				.set({ attributes: ['urlName', 'id'] })
				.where({ shopable: true })
				.get({ raw: true })
		)
		return rows.map((row) => {
			return `/p/${row.urlName}/${row.id}`
		})
	},
})

SitemapMaker.builder('shop-all', {
	urls: async () => {
		let shop = await ShopService.buildShop({ categoriesUrlNames: ['shop'] })
		let { lastPage } = shop.pagination
		let urls = []
		for (let i = 1; i <= lastPage; i++) {
			urls.push(`/shop/${i}`)
		}
		return urls
	},
})

SitemapMaker.builder('shop-collections', {
	urls: async () => {
		let shopCollections = await ConfigService.getActiveData('ShopCollections')
		let keywords = []
		for (let { urlKeywords } of shopCollections) {
			keywords = keywords.concat(urlKeywords)
		}
		return keywords.map((keyword) => `/${keyword}`)
	},
})

SitemapMaker.builder('shop-categories', {
	urls: async () => {
		let urls = []
		let recurs = (category, path = '') => {
			path += `/${category.urlName}`
			urls.push(`${path}/1`)
			category.children.forEach((subcat) => recurs(subcat, path))
		}
		let mainTree = await CategoryService.getTree()
		mainTree.forEach((category) => recurs(category))
		return urls
	},
})
