const { apiRouter: shopApiRouter } = require('#/shop')
const { CheckoutManager } = require('#/shop-order')
const { _try } = require('#/utils')
const ShippingMethod = require('./shipping-method')

shopApiRouter.post(
	'/checkout/delivery/shipping/andreani/calculate',
	_try(async (req, res) => {
		const checkoutMng = await CheckoutManager.create(req, res, req.query.hash)
		if (!checkoutMng) return res.api.error(null).json()
		const shippingMethod = new ShippingMethod(checkoutMng.orderMng)
		const { zipcodeId } = req.body
		const result = await shippingMethod.calculate(zipcodeId)
		res.api.data({ ...result }).json()
	})
)
