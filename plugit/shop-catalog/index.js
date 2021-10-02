exports.apiBaseUrl = process.env.VUE_APP_SHOP_API_BASE_URL = '/api'
exports.productBaseUrl = process.env.VUE_APP_SHOP_PRODUCT_BASE_URL = '/p'
exports.shopBaseUrl = process.env.VUE_APP_SHOP_BASE_URL = '/'
exports.shopAllKeyword = process.env.VUE_APP_SHOP_ALL_KEYWORD = 'shop'

exports.__init = () => {
	require('./admin-api-router')
	require('./admin-permissions')
	require('./admin-pages')
	require('./admin-configs-definitions')
	require('./shop-api-router')
	require('./sitemap-setup')

	exports.AttrService = require('./services/attr-service')
	exports.BrandService = require('./services/brand-service')
	exports.CategoryService = require('./services/category-service')
	exports.CollectionService = require('./services/collection-service')
	exports.PriceService = require('./services/price-service')
	exports.PriceConfigService = require('./services/price-config-service')
	exports.ProductManager = require('./services/product-manager')
	exports.ProductService = require('./services/product-service')
	exports.ProductImageService = require('./services/product-image-service')
	exports.ShopService = require('./services/shop-service')
	exports.StockService = require('./services/stock-service')
	exports.TagService = require('./services/tag-service')
	require('./services/product-status-service')
	require('./services/product-order-item-adaptor')
}
