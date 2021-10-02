exports.__init = () => {
	require('./admin-api-router')
	require('./admin-pages')
	require('./admin-configs-definitions')
	exports.apiRouter = require('./api-router')
	exports.UserService = require('./services/user-service')
	exports.authMid = require('./mids/auth')
}
