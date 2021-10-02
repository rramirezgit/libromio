const { Router } = require('express')
const UserService = require('./services/user-service')
const { _try, emitter } = require('#/utils')
const {
	authMids: { ensurePermission },
	apiRouter: adminApiRouter,
} = require('#/admin')

const router = Router()
adminApiRouter.use('/users', ensurePermission('full'), router)

router.get(
	'/users',
	_try(async (req, res, next) => {
		let { users, pagination } = await UserService.getAll({
			...req.query,
			sortDesc: req.query.sortDesc == 'true',
		})
		res.api.data({ users, pagination }).json()
	})
)

router.put(
	'/blacklist/:id',
	_try(async (req, res, next) => {
		let apiRes = await UserService.blacklist(req.params.id, req.body.blacklisted)
		res.api.set(apiRes).json()
	})
)

router.put(
	'/reset-password/:id',
	_try(async (req, res, next) => {
		let apiRes = await UserService.resetPassword(
			req.params.id,
			req.body.randomPassword ? true : req.body.rawPassword
		)
		let { data, success } = apiRes.get()
		if (!success) return res.api.set(apiRes).json()
		let { user, rawPassword } = data
		await emitter.emit('Request.USER_RESET_PASS', { user, rawPassword, req, res })
		return res.api.data({ rawPassword }).json()
	})
)
