const { apiRouter: shopApiRouter } = require('#/shop')
const { CheckoutManager } = require('#/shop-order')
const { _try } = require('#/utils')
const ShippingMethod = require('./shipping-method')

shopApiRouter.post(
	'/checkout/delivery/shipping/calculate',
	_try(async (req, res, next) => {
		let checkoutMng = await CheckoutManager.create(req, res, req.query.hash)
		if (!checkoutMng) return res.api.error(null).json()
		let shippingMethod = new ShippingMethod(checkoutMng.orderMng)
		let { zipcodeId } = req.body
		let result = await shippingMethod.calculate(zipcodeId)
		res.api.data({ ...result }).json()
	})
)
