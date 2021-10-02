const { adminUrl } = require('./index')
const AdminService = require('./services/admin-service')
const { _try } = require('#/utils')

exports.validateToken = () =>
	_try(async (req, res, next) => {
		let loginUrl = adminUrl('/login')
		if (req.originalUrl.startsWith(loginUrl)) {
			return next()
		}

		req.adminSvc = await AdminService.validateToken(req, res)
		if (req.adminSvc) {
			next()
		} else {
			res.api.redirect(loginUrl)
		}
	})

exports.ensurePermission = (permissionKey) =>
	_try(async (req, res, next) => {
		if (req.adminSvc && req.adminSvc.hasAccess(permissionKey)) {
			return next()
		}
		if (req.xhr) {
			res.api.error('unauthorized').json()
		} else {
			res.redirect(adminUrl('?err=unauthorized'))
		}
	})
