const _ = require('lodash')
const { db } = require('#/express')
const _adaptors = {}

class OrderItemAdaptor {
	/**
	 * @param {string} refType
	 * @param {{
	 * 	refItem: () => Object,
	 * 	orderItemData: () => Object,
	 * 	validateQty: () => { sku, name, variantName, initPrice, price, discountPct, discountName, image: mainImage.squareUrl, qty },
	 * 	cartData: () => Object,
	 * }} adaptorFns
	 */
	static register(refType, adaptorFns) {
		_adaptors[refType] = adaptorFns
	}

	constructor(refType, refId, qty, context = {}) {
		this._refType = refType
		this._refId = refId
		this._qty = qty || 1
		this._context = context
		this._adaptor = _adaptors[refType]
	}

	get _adaptorParams() {
		return {
			refId: this._refId,
			qty: this._qty,
			context: this._context,
			refItem: this._refItem,
		}
	}

	/**
	 * @param {{validateQty: boolean}} options
	 */
	async build(options = {}) {
		let data = await this.getOrderItemData()
		if (!data) return null

		if (options.validateQty) {
			let newQty = await this.validateQty()
			if (newQty === false) return null
			data.qty = newQty
		}

		data = _.defaults(data, {
			qty: this._qty,
			refType: this._refType,
			refId: this._refId,
		})

		if (!data.initPrice) return null

		if (data.discountPct) {
			data.discountPct = Math.min(100, Math.abs(data.discountPct))
			data.discount = Number((data.initPrice * (data.discountPct / 100)).toFixed(2))
			data.discountTotal = Number((data.discount * data.qty).toFixed(2))
			data.discountName = data.discountName || 'Descuento'
		} else {
			data.discountPct = 0
			data.discount = 0
			data.discountTotal = 0
			data.discountName = null
		}

		data.initTotal = Number((data.initPrice * data.qty).toFixed(2))
		data.price = Math.max(0, data.initPrice - data.discount)
		data.discountTotal = Number((data.discount * data.qty).toFixed(2))
		data.total = Math.max(0, data.initTotal - data.discountTotal)

		const orderItem = db.OrderItem.build(data)
		const qtyChanged = orderItem.qty != this._qty

		return { orderItem, qtyChanged }
	}

	async getRefItem() {
		if (!this._refItem) {
			this._refItem = await this._adaptor?.refItem(this._adaptorParams)
		}
		return this._refItem
	}

	async getOrderItemData() {
		if (!(await this.getRefItem())) return null
		return await this._adaptor?.orderItemData(this._adaptorParams)
	}

	async validateQty() {
		if (!(await this.getRefItem())) return null
		return await this._adaptor?.validateQty(this._adaptorParams)
	}

	async getCartData() {
		if (!(await this.getRefItem())) return null
		return await this._adaptor?.cartData(this._adaptorParams)
	}
}

module.exports = OrderItemAdaptor
