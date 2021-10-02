const { Router } = require('express')
const { adminUrl } = require('./index')
const { ensurePermission } = require('./auth-mids')
const PermissionsService = require('./services/permissions-service')
const ConfigService = require('./services/config-service')
const AdminService = require('./services/admin-service')
const AdminPagesService = require('./services/admin-pages-service')
const { _try } = require('#/utils')
const { db } = require('#/express')

const router = Router()

router.get(
	'/main-data',
	_try(async (req, res, next) => {
		let routes = AdminPagesService.getAdminRoutes(req.adminSvc)
		let admin = req.adminSvc.admin
		res.api.data({ routes, admin }).json()
	})
)

router.get(
	'/logout',
	_try(async (req, res, next) => {
		req.adminSvc.logout(req, res)
		let loginUrl = adminUrl('/login')
		res.api.redirect(loginUrl)
	})
)

router.put(
	'/admin/me',
	_try(async (req, res, next) => {
		let apiRes = await AdminService.updateInfo(req.adminSvc.admin, req.body)
		res.api.set(apiRes).json()
	})
)

router.get(
	'/admin/users',
	_try(async (req, res, next) => {
		let users = await AdminService.getAll()
		res.api.data({ users }).json()
	})
)

router.post(
	'/admin/users',
	_try(async (req, res, next) => {
		let data = req.body.user
		data.updatedBy = req.adminSvc.admin.username
		let apiRes = await AdminService.save(null, data)
		res.api.set(apiRes).json()
	})
)

router.put(
	'/admin/users/:id',
	_try(async (req, res, next) => {
		let data = req.body.user
		data.updatedBy = req.adminSvc.admin.username
		let apiRes = await AdminService.save(req.params.id, data)
		res.api.set(apiRes).json()
	})
)

router.delete(
	'/admin/users/:id',
	ensurePermission('full'),
	_try(async (req, res, next) => {
		let apiRes = await AdminService.delete(req.params.id)
		res.api.set(apiRes).json()
	})
)

router.put(
	'/admin/users/blacklist/:id',
	ensurePermission('full'),
	_try(async (req, res, next) => {
		let users = await AdminService.blacklist(req.params.id)
		res.api.data({ users }).json()
	})
)

router.put(
	'/admin/users/resetpass/:id',
	ensurePermission('full'),
	_try(async (req, res, next) => {
		let users = await AdminService.resetpass(req.params.id)
		res.api.data({ users }).json()
	})
)

router.get(
	'/admin/permissions',
	_try(async (req, res, next) => {
		let permissions = PermissionsService.getAll()
		res.api.data({ permissions }).json()
	})
)

router.get(
	'/admin/configs-definitions',
	_try(async (req, res, next) => {
		let defs = await ConfigService.getAllDefinitions()
		res.api.data({ definitions: defs }).json()
	})
)

router.get(
	'/admin/configs/:keyname',
	_try(async (req, res, next) => {
		let configs = await ConfigService.getAll(req.params.keyname)
		configs = db.Config.serializeAll(configs, 'admin')
		res.api.data({ configs }).json()
	})
)

router.post(
	'/admin/configs',
	_try(async (req, res, next) => {
		Object.assign(req.body.config, {
			id: null,
			updatedBy: req.adminSvc.admin.username,
		})
		let apiRes = await ConfigService.save(req.body.config, req.files)
		res.api.set(apiRes).json()
	})
)

router.put(
	'/admin/configs/:id',
	_try(async (req, res, next) => {
		Object.assign(req.body.config, {
			id: req.params.id,
			updatedBy: req.adminSvc.admin.username,
		})
		let apiRes = await ConfigService.save(req.body.config, req.files)
		res.api.set(apiRes).json()
	})
)

router.delete(
	'/admin/configs/:id',
	_try(async (req, res, next) => {
		let apiRes = await ConfigService.delete(req.params.id)
		res.api.set(apiRes).json()
	})
)

module.exports = router
