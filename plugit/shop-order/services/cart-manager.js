const OrderManager = require('./order-manager')

const _cartCookieKey = 'cart'
const _cartCookieExpirationDays = 60

class CartManager {
	static async fromCookie(req, res, forceBuild = false) {
		let id = req.cookies[_cartCookieKey]
		if (!id && !forceBuild) return null

		let orderMng = null
		let userId = req.user?.id

		if (id) {
			orderMng = await OrderManager.fromId(id)
			if (orderMng) {
				let { order } = orderMng
				if (!order.isCart || (order.userId && userId && order.userId != userId)) {
					orderMng = null
				}
			}
		}

		if (!orderMng) {
			if (id) res.clearCookie(_cartCookieKey)
			if (forceBuild) orderMng = new OrderManager()
			else return null
		}

		if (userId) await orderMng.setUser(userId)

		return new CartManager(orderMng, req, res)
	}

	constructor(orderMng, req, res) {
		this._orderMng = orderMng
		this._req = req
		this._res = res
	}

	get orderMng() {
		return this._orderMng
	}

	addItem(refType, refId, qty, sumQty = false) {
		this._orderMng.addItem({ refType, refId, qty }, { sumQty })
		return this
	}

	removeItem(refType, refId) {
		this._orderMng.removeItem({ refType, refId })
		return this
	}

	async refresh() {
		await this._orderMng.refresh({ validateQty: true })
		if (this._orderMng.empty) {
			this._res.clearCookie(_cartCookieKey)
		} else {
			for (let item of this._orderMng.items) {
				item.cartData = await item.adaptor.getCartData()
			}
			this._res.cookie(_cartCookieKey, this._orderMng.order.id, {
				maxAge: _cartCookieExpirationDays * 24 * 60 * 60 * 1000,
			})
		}
		return this
	}

	getCartData() {
		return {
			order: this._orderMng.empty ? null : this._orderMng.order,
			autoModified: this._orderMng.autoModified,
		}
	}
}

module.exports = CartManager
