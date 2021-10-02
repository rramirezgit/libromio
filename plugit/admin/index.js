exports.adminBaseUrl = process.env.VUE_APP_ADMIN_BASE_URL = '/admin'
exports.adminApiBaseUrl = process.env.VUE_APP_ADMIN_API_BASE_URL = '/admin/api'
exports.adminUrl = (path = '') => `${exports.adminBaseUrl}${path}`

exports.__init = () => {
	exports.ConfigService = require('./services/config-service')
	exports.AdminPagesService = require('./services/admin-pages-service')
	exports.PermissionsService = require('./services/permissions-service')
	exports.authMids = require('./auth-mids')
	exports.apiRouter = require('./api-router')
	exports.router = require('./router')
	exports.mailerConfigCreator = require('./mailer-config-creator')

	require('./admin-pages')
	require('./admin-configs-definitions')
	require('./mailer-setup.js')
}
