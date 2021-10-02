const Flow = require('./flow')
const { db } = require('#/express')
const { emitter } = require('#/utils')

class PaymentMethodStatusFlow extends Flow {
	static _statuses = {}

	constructor(orderMng) {
		super()
		this._orderMng = orderMng
	}

	get _order() {
		return this._orderMng.order
	}

	get _payment() {
		return this._order.payments[0]
	}

	_getCurrentKey() {
		return this._payment.status
	}

	async _canAssign(status, opts) {
		return !this._orderMng.mainStatusFlow.is('canceled')
	}

	async _assign(status, opts) {
		await db.$transaction(async (t) => {
			await this._orderMng.savePayment({
				...(opts.data || {}),
				id: this._payment.id,
				status: status.key,
			})
			await emitter.emit('Order.payment.STATUS', {
				orderMng: this._orderMng,
				payment: this._payment,
				status: status.key,
				t,
			})
		})
	}

	async _afterAssign(status, opts) {
		return null
	}
}

module.exports = PaymentMethodStatusFlow
