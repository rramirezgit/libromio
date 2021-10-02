const Flow = require('./flow')
const { db } = require('#/express')
const { emitter } = require('#/utils')

class DeliveryStatusFlow extends Flow {
	static _statuses = {}

	constructor(orderMng) {
		super()
		this._orderMng = orderMng
	}

	get _order() {
		return this._orderMng.order
	}

	_getCurrentKey() {
		return this._orderMng.order.deliveryStatus
	}

	async _canAssign(status, opts) {
		return this._orderMng.paymentStatusFlow.current('key') == 'paid'
	}

	async _assign(status, opts) {
		await db.$transaction(async (t) => {
			this._order.deliveryStatus = status.key
			await this._order.save()
			await emitter.emit('Order.DELIVERY_STATUS', {
				orderMng: this._orderMng,
				deliveryStatus: status.key,
				t,
			})
		})
	}

	async _afterAssign(status, opts) {
		return null
	}
}

DeliveryStatusFlow.define({
	pending: {
		name: 'Pendiente',
		color: 'yellow',
		flowsTo: ['delivered'],
	},
	delivered: {
		name: 'Entregada',
		color: 'success',
		flowsTo: ['returned'],
		async afterAssign() {
			await this._orderMng.setMainStatus('completed')
		},
	},
	returned: {
		name: 'Devuelta',
		color: 'purple',
		flowsTo: false,
		/*async afterAssign() {
			await this._orderMng.setMainStatus('canceled')
		},*/
	},
})

module.exports = DeliveryStatusFlow
