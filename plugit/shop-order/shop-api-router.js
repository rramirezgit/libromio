const AddressService = require('./services/address-service')
const OrderService = require('./services/order-service')
const OrderManager = require('./services/order-manager')
const CartManager = require('./services/cart-manager')
const CheckoutManager = require('./services/checkout-manager')
const PaymentService = require('./services/payment-service')
const { _try, emitter } = require('#/utils')
const { apiRouter: shopApiRouter } = require('#/shop')
const { authMid: userAuthMid } = require('#/user')
const Cryptr = require('cryptr')

// USER -------------------------------------------------------------------------
shopApiRouter.get(
	'/user/orders',
	userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		let { orders } = await OrderService.getAll({ userId: req.user.id, limit: 1000, scope: 'list' })
		for (let order of orders) new OrderManager(order).includeStatusesInfo()
		res.api.data({ orders }).json()
	})
)

shopApiRouter.get(
	'/user/order/:id',
	userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromId(req.params.id)
		if (orderMng && orderMng.order.userId == req.user.id) {
			orderMng.includeStatusesInfo()
			res.api.data({ order: orderMng.order }).json()
		} else {
			res.api.data({ order: null }).json()
		}
	})
)

// ADDRESSES -------------------------------------------------------------------------
const addressesCookieCryptr = new Cryptr('addresses-cookie-cryptr')
let getCookieAddressesIds = (req) => {
	let cookieStr = req.cookies['user-addresses']
	try {
		let ids = cookieStr ? addressesCookieCryptr.decrypt(cookieStr) : null
		return ids ? JSON.parse(ids) : []
	} catch (err) {
		return []
	}
}
let setCookieAddressesIds = (res, ids) => {
	if (!ids || !ids.length) {
		return res.clearCookie('user-addresses')
	}
	try {
		let cookieStr = addressesCookieCryptr.encrypt(JSON.stringify(ids))
		res.cookie('user-addresses', cookieStr, { maxAge: 30 * 24 * 60 * 60 * 1000 })
	} catch (err) {}
}

emitter.on('Request.USER_LOGIN', async ({ req, res, user }) => {
	let addressesIds = getCookieAddressesIds(req)
	for (let id of addressesIds) {
		await AddressService.save({ id, userId: user.id })
	}
	setCookieAddressesIds(res, null)
})

emitter.on('Request.USER_LOGOUT', async ({ req, res, user }) => {
	let ids = (await AddressService.getAll(user.id)).map((a) => a.id)
	setCookieAddressesIds(res, ids)
})

shopApiRouter.get(
	'/user/addresses',
	//userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		let addresses = []
		let userId = req.user?.id
		if (userId) {
			addresses = await AddressService.getAll(userId)
		} else {
			let ids = getCookieAddressesIds(req)
			if (ids.length) {
				addresses = await AddressService.getByIds(ids)
			}
		}
		res.api.data({ addresses }).json()
	})
)

shopApiRouter.get(
	'/user/address/:id',
	//userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		let address = null
		let userId = req.user?.id || null
		let addressId = req.params.id
		if (userId) {
			address = await AddressService.get(addressId, userId)
		} else {
			let ids = getCookieAddressesIds(req)
			if (ids.includes(addressId)) {
				address = await AddressService.get(addressId)
			}
		}
		res.api.data({ address }).json()
	})
)

shopApiRouter.post(
	'/user/address',
	//userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		let userId = req.user?.id || undefined
		let apiRes = await AddressService.save({ ...req.body, id: null, userId })
		let { success, data } = apiRes.get()
		if (success) {
			data.address = await AddressService.get(data.id, userId)
			if (!userId) {
				let ids = getCookieAddressesIds(req)
				ids.push(data.id)
				setCookieAddressesIds(res, ids)
			}
		}

		res.api.set(apiRes).json()
	})
)

shopApiRouter.put(
	'/user/address/:id',
	//userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		let userId = req.user?.id || undefined
		let apiRes = await AddressService.save({ ...req.body, id: req.params.id, userId })
		let { success, data } = apiRes.get()
		if (success) {
			data.address = await AddressService.get(data.id, userId)
			if (!userId) {
				let ids = getCookieAddressesIds(req)
				if (!ids.includes(data.id)) {
					ids.push(data.id)
					setCookieAddressesIds(res, ids)
				}
			}
		}
		res.api.set(apiRes).json()
	})
)

/*shopApiRouter.delete(
	'/user/address/:id',
	userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		let apiRes = await AddressService.delete(req.params.id, req.user.id)
		res.api.set(apiRes).json()
	})
)*/

shopApiRouter.get(
	'/user/zipcode/:code',
	_try(async (req, res, next) => {
		let zipcode = await AddressService.getZipcode(req.params.code)
		if (zipcode) {
			res.api.data({ zipcode }).json()
		} else {
			res.api.validation('zipcode', 'El código postal es inválido').json()
		}
	})
)

// CART -------------------------------------------------------------------------
shopApiRouter.post(
	'/cart/item',
	_try(async (req, res, next) => {
		let { type, id, qty } = req.body
		let cartMng = await CartManager.fromCookie(req, res, true)
		cartMng.addItem(type, id, qty, true)
		await cartMng.refresh()
		res.api.data(cartMng.getCartData()).json()
	})
)

shopApiRouter.put(
	'/cart/item',
	_try(async (req, res, next) => {
		let { type, id, qty } = req.body
		let cartMng = await CartManager.fromCookie(req, res, true)
		cartMng.addItem(type, id, qty)
		await cartMng.refresh()
		res.api.data(cartMng.getCartData()).json()
	})
)

shopApiRouter.delete(
	'/cart/item',
	_try(async (req, res, next) => {
		let { type, id } = req.body
		let cartMng = await CartManager.fromCookie(req, res, true)
		cartMng.removeItem(type, id)
		await cartMng.refresh()
		res.api.data(cartMng.getCartData()).json()
	})
)

// CHECKOUT -------------------------------------------------------------------------
const checkoutMid = () => async (req, res, next) => {
	if (!req.query.hash) {
		return res.api.error('Checkout hash inválido').json()
	}
	const checkoutMng = await CheckoutManager.create(req, res, req.query.hash)
	if (!checkoutMng) return res.api.error(null).json()
	req.checkoutMng = checkoutMng
	next()
}

shopApiRouter.get(
	'/checkout/init',
	_try(async (req, res, next) => {
		let checkoutMng = await CheckoutManager.create(req, res)
		if (!checkoutMng) return res.api.error(null).json()
		let apiRes = await checkoutMng.refresh()
		apiRes.data({ nextStep: CheckoutManager.steps[0] })
		res.api.set(apiRes).json()
	})
)

shopApiRouter.get(
	'/checkout/step/:step',
	checkoutMid(),
	_try(async (req, res, next) => {
		let stepKey = req.params.step
		let checkoutApiRes = await req.checkoutMng.refresh({ currentStep: stepKey })
		let stepApiRes = await req.checkoutMng.getStepData(stepKey)
		res.api
			.merge(checkoutApiRes)
			.merge(stepApiRes)
			.json()
	})
)

shopApiRouter.post(
	'/checkout/step/:step',
	checkoutMid(),
	_try(async (req, res, next) => {
		let stepKey = req.params.step
		let payload = req.body
		let apiRes = await req.checkoutMng.setStepData(stepKey, payload)
		res.api.set(apiRes).json()
	})
)

shopApiRouter.get(
	'/order/:id/payment',
	userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromId(req.params.id)
		if (!orderMng || orderMng.order.userId != req.user.id) {
			return res.api.error('La orden de compra es inexistente').json()
		}
		if (orderMng.order.paymentStatus == 'paid') {
			return res.api
				.error({
					code: 'already_paid',
					text: 'El pago de la orden de compra ya se encuentra acreditado',
				})
				.json()
		}
		if (orderMng.order.mainStatus != 'confirmed') {
			return res.api
				.error({
					code: 'unexpected_payment',
					text: 'El estado de la orden de compra no permite recibir pagos',
				})
				.json()
		}
		let { methodKey } = orderMng.order.payments[0]
		let method = PaymentService.getMethod(methodKey, orderMng)
		let apiRes = await method.resolveOrderConfirmationResponse()
		res.api.set(apiRes).json()
	})
)
