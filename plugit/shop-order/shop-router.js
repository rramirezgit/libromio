const OrderManager = require('./services/order-manager')
const { _try } = require('#/utils')
const { router: shopRouter } = require('#/shop')
const { authMid: userAuthMid } = require('#/user')
const fs = require('fs')

shopRouter.get(
	'/order/:id/download-digital/:itemId',
	userAuthMid.ensureAuth(),
	_try(async (req, res, next) => {
		let { id, itemId } = req.params
		let orderMng = await OrderManager.fromId(id, req.user.id)
		if (!orderMng) return res.redirect(`/user/orders`)
		let item = orderMng.items.find((item) => item.id == itemId)
		let filename = item && item.type == 'digital' && item.digital?.filename
		let filepath = filename ? `storage/digital-products/${filename}` : null
		if (!filepath || !fs.existsSync(filepath)) {
			return res.redirect(`/user/orders/${id}`)
		}
		let realFilename = item.digital.real || filename
		res.download(filepath, realFilename)
	})
)
