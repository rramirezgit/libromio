const Flow = require('./flow')
const { db } = require('#/express')
const moment = require('moment')
const { emitter } = require('#/utils')

class PaymentStatusFlow extends Flow {
	static _statuses = {}

	constructor(orderMng) {
		super()
		this._orderMng = orderMng
	}

	get _order() {
		return this._orderMng.order
	}

	_getCurrentKey() {
		return this._orderMng.order.paymentStatus
	}

	async _canAssign(status, opts) {
		return true
	}

	async _assign(status, opts) {
		await db.$transaction(async (t) => {
			this._order.paymentStatus = status.key
			await this._order.save()
			await emitter.emit('Order.PAYMENT_STATUS', {
				orderMng: this._orderMng,
				paymentStatus: status.key,
				t,
			})
		})
	}

	async _afterAssign(status, opts) {
		return null
	}
}

PaymentStatusFlow.define({
	pending: {
		name: 'Pendiente',
		color: 'yellow',
		flowsTo: ['partiallyPaid', 'paid'],
	},
	partiallyPaid: {
		name: 'Pago parcial acreditado',
		color: 'orange',
		flowsTo: ['paid', 'refunded'],
	},
	paid: {
		name: 'Pago acreditado',
		color: 'success',
		flowsTo: ['refunded'],
		beforeAssign() {
			this._order.paidAt = moment()
		},
		async afterAssign() {
			if (!this._order.delivery) {
				await this._orderMng.mainStatusFlow.assign('completed')
			}
		},
	},
	refunded: {
		name: 'Pago devuelto',
		color: 'purple',
		flowsTo: false,
		async afterAssign() {
			await this._orderMng.setMainStatus('canceled')
		},
		canAssign() {
			return this._orderMng.deliveryStatusFlow.is('returned', 'pending')
		},
	},
})

module.exports = PaymentStatusFlow
