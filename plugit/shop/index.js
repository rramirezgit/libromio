exports.apiBaseUrl = process.env.VUE_APP_SHOP_API_BASE_URL = '/api'

exports.__init = () => {
	require('./admin-configs-definitions')
	require('./mailer-setup')
	require('./render-data-setup')
	exports.apiRouter = require('./api-router')
	exports.router = require('./router')
	exports.shopApp = require('./shop-app')
	exports.UserWishlistService = require('./services/user-wishlist-service')
}
