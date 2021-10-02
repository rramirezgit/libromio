const Flow = require('./flow')
const { db } = require('#/express')
const { emitter } = require('#/utils')

class DeliveryMethodStatusFlow extends Flow {
	static _statuses = {}

	constructor(orderMng) {
		super()
		this._orderMng = orderMng
	}

	get _order() {
		return this._orderMng.order
	}

	get _delivery() {
		return this._order.delivery
	}

	_getCurrentKey() {
		return this._delivery.status
	}

	async _canAssign(status, opts) {
		return (
			this._orderMng.paymentStatusFlow.is('paid', 'refunded') &&
			!this._orderMng.mainStatusFlow.is('canceled')
		)
	}

	async _assign(status, opts) {
		await db.$transaction(async (t) => {
			await this._orderMng.saveDelivery({
				...(opts.data || {}),
				id: this._delivery.id,
				status: status.key,
			})
			await emitter.emit('Order.delivery.STATUS', {
				orderMng: this._orderMng,
				delivery: this._delivery,
				status: status.key,
				t,
			})
		})
	}

	async _afterAssign(status, opts) {
		return null
	}
}

module.exports = DeliveryMethodStatusFlow
