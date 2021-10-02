const { Router } = require('express')
const { Mailer } = require('#/mailer')
const UserWishlistService = require('./services/user-wishlist-service')
const { apiRouter: userApiRouter, authMid: userAuthMid } = require('#/user')
const { _try, emitter } = require('#/utils')

const router = Router()

router.use(userApiRouter)

emitter.on('Request.USER_RESET_PASS', async ({ req, res, user, rawPassword }) => {
	let { success, enqueued } = await Mailer.buildAndSend('users.reset-pass', { user, password: rawPassword })
	res.api.data({ email: { success, enqueued } })
})

router.post(
	'/wishlist/:action/:productId',
	userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		if (req.params.action == 'add') {
			await UserWishlistService.addProduct(req.user.id, req.params.productId)
		} else {
			await UserWishlistService.removeProduct(req.user.id, req.params.productId)
		}
		res.api.json()
	})
)

router.get(
	'/wishlist/products-ids',
	userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		const productsIds = await UserWishlistService.getProductsIds(req.user.id)
		res.api.data({ productsIds }).json()
	})
)

router.get(
	'/wishlist/products',
	userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		const products = await UserWishlistService.getProducts(req.user.id, ['card', 'shopable'])
		res.api.data({ products }).json()
	})
)

module.exports = router
