const { RenderData } = require('#/utils')
const CartManager = require('./services/cart-manager')

RenderData.addSrv('site', async (req, res) => {
	let cartMng = await CartManager.fromCookie(req, res)
	let cart = cartMng ? (await cartMng.refresh()).getCartData() : {}
	return { cart }
})
