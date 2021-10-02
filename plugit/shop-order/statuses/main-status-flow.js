const Flow = require('./flow')
const { db } = require('#/express')
const moment = require('moment')
const { emitter } = require('#/utils')

class MainStatusFlow extends Flow {
	static _statuses = {}

	constructor(orderMng) {
		super()
		this._orderMng = orderMng
	}

	get _order() {
		return this._orderMng.order
	}

	_getCurrentKey() {
		return this._orderMng.order.mainStatus
	}

	async _canAssign(status, opts) {
		return true
	}

	async _assign(status, opts) {
		await db.$transaction(async (t) => {
			this._order.mainStatus = status.key
			await this._order.save()
			await emitter.emit('Order.MAIN_STATUS', {
				orderMng: this._orderMng,
				mainStatus: status.key,
				t,
			})
		})
	}

	async _afterAssign(status, opts) {
		return null
	}
}

MainStatusFlow.define({
	cart: {
		name: 'En carrito',
		flowsTo: ['confirmed'],
	},
	confirmed: {
		name: 'Confirmada',
		flowsTo: ['completed', 'canceled'],
		color: 'blue',
		beforeAssign() {
			this._order.confirmedAt = moment()
		},
	},
	completed: {
		name: 'Finalizada',
		color: 'success',
		manual: false,
		flowsTo: ['canceled'],
	},
	canceled: {
		name: 'Cancelada',
		color: 'error',
		flowsTo: false,
		canAssign() {
			return (
				this._orderMng.paymentMethod.statusFlow.is('refunded', 'pending') &&
				this._orderMng.deliveryMethod.statusFlow.is('returned', 'pending')
			)
		},
	},
})

module.exports = MainStatusFlow
