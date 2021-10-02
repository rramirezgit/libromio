const jwt = require('jsonwebtoken')
const { ApiRes, v, _try } = require('#/utils')
const UserService = require('../services/user-service')

/**
 * @param {{
 * 	useCookie: boolean,
 * 	tokenCookieName: string,
 * 	expirationDays: number,
 * }} options
 */
exports.tokenAuth = () =>
	_try(async (req, res, next) => {
		req.user = await cookieTokenAuth(req, res)
		next()
	})

exports.ensureAuth = onFail => async (req, res, next) => {
	if (req.user) return next()
	if (!onFail) {
		res.status(401)
		res.api.error({ code: 401 }).json()
	} else {
		await onFail(req, res, next)
	}
}

const cookieTokenAuth = async (req, res) => {
	let token = req.cookies[UserService.tokenCookieName]
	if (!token) return null
	let user = await UserService.validateToken(token)
	if (!user) return null
	res.cookie(UserService.tokenCookieName, token, {
		maxAge: UserService.tokenExpirationDays * 24 * 60 * 60 * 1000,
	})
	return user
}

/*const headerTokenAuth = async (options, req) => {
	let { authorization } = req.headers
	if(!authorization) return next()
	let m = authorization.trim().match(/^Bearer (.+)$/)
	let token = m && m[1]
	debug(token)
	if(!token) return next()
	req.user = await UserService.validateTokentoken(token)
}*/
