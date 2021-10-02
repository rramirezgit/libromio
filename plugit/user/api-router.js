const { Router } = require('express')
const jwt = require('jsonwebtoken')
const UserService = require('./services/user-service')
const { ensureAuth } = require('./mids/auth')
const { _try, ApiRes, emitter, v } = require('#/utils')
const { db } = require('#/express')

const router = Router()

// // Require Passport Config
// require('./config-passport')(passport)
// // Passport Middlewares
// router.use(passport.initialize())

const onSignup = async (req, res, apiRes) => {
	const { data, success } = apiRes.get()
	if (!success) return
	await emitter.emit('Request.USER_SIGNUP', { user: data.user, req, res })
	await onLogin(req, res, apiRes)
}

const onLogin = async (req, res, apiRes) => {
	const { data, success } = apiRes.get()
	if (!success) return
	await emitter.emit('Request.USER_LOGIN', { user: data.user, req, res })
	data.user = data.user.serialize('account')
}

const onLogout = async (req, res) => {
	await emitter.emit('Request.USER_LOGOUT', { user: req.user, req, res })
}

router.post(
	'/user/signup',
	_try(async (req, res) => {
		const apiRes = await UserService.emailSignup(req.body, res)
		await onSignup(req, res, apiRes)
		res.api.set(apiRes).json()
	})
)

router.post(
	'/user/signin',
	_try(async (req, res) => {
		const apiRes = await UserService.emailLogin(req.body.email, req.body.password, res)
		await onLogin(req, res, apiRes)
		res.api.set(apiRes).json()
	})
)

router.post(
	'/user/reset-pass',
	_try(async (req, res) => {
		let accountEmail = req.body.email
		let result = await v.validate(accountEmail, [v.required(), v.email()])
		if (result !== true) return res.api.validation('email', result).json()

		let user = await db.User.findOne({ where: { accountEmail } })
		if (!user) return res.api.json()

		let apiRes = await UserService.resetPassword(user.id, true)
		let { data, success } = apiRes.get()
		if (!success) return res.api.json()

		let { rawPassword } = data
		await emitter.emit('Request.USER_RESET_PASS', { user, rawPassword, req, res })
		res.api.json()
	})
)

router.post(
	'/user/auth/google',
	_try(async (req, res) => {
		const { googleAccessToken } = req.body
		const apiRes = await UserService.googleAuth(googleAccessToken, res)
		await onLogin(req, res, apiRes)
		res.api.set(apiRes).json()
	})
)

router.post(
	'/user/auth/facebook',
	_try(async (req, res) => {
		const { facebookAccessToken, facebookId } = req.body
		const apiRes = await UserService.facebookAuth(facebookAccessToken, facebookId, res)
		await onLogin(req, res, apiRes)
		res.api.set(apiRes).json()
	})
)

router.put(
	'/user/user-update',
	ensureAuth(),
	_try(async (req, res, next) => {
		const apiRes = await UserService.save({ ...req.body, id: req.user.id }, { validateNames: true })
		const { data, validation } = apiRes.get()
		data.user = data.user?.serialize('account')
		res.api.set(apiRes).json()
	})
)

router.put(
	'/user/password-update',
	ensureAuth(),
	_try(async (req, res) => {
		const { currentPassword, rawPassword, rawPassword2 } = req.body
		const apiRes = await UserService.passwordUpdate(req.user.id, currentPassword, rawPassword, rawPassword2)
		res.api.set(apiRes).json()
	})
)

router.post(
	'/user/logout',
	ensureAuth(),
	_try(async (req, res, next) => {
		UserService.logout(res)
		await onLogout(req, res)
		res.api.data({ success: true }).json()
	})
)

module.exports = router
