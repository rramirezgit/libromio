const { Router } = require('express')
const { adminUrl } = require('./index')
const AdminService = require('./services/admin-service')
const ConfigService = require('./services/config-service')
const { _try } = require('#/utils')

const router = Router()

router.get(
	['/login', '/login/*'],
	_try(async (req, res, next) => {
		let AdminTheme = await ConfigService.getActiveData('AdminTheme')
		res.render('admin-login', { __SRV: { AdminTheme }, AdminTheme })
	})
)

router.post(
	'/login',
	_try(async (req, res, next) => {
		let adminSvc = await AdminService.login(
			req.body.username,
			req.body.password,
			req.body.remember,
			req,
			res
		)
		if (adminSvc) {
			res.api.redirect(adminUrl())
		} else {
			res.api.error('unauthorized').json()
		}
	})
)

module.exports = router
