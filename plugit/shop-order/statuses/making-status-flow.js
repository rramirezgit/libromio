const Flow = require('./flow')
const { db } = require('#/express')
const { emitter } = require('#/utils')

class MakingStatusFlow extends Flow {
	static _statuses = {}

	constructor(orderMng) {
		super()
		this._orderMng = orderMng
	}

	get _order() {
		return this._orderMng.order
	}

	_getCurrentKey() {
		return this._orderMng.order.makingStatus
	}

	async _canAssign(status, opts) {
		return this._orderMng.paymentMethod.statusFlow.current('key') == 'paid'
	}

	async _assign(status, opts) {
		await db.$transaction(async (t) => {
			this._order.makingStatus = status.key
			await this._order.save()
			await emitter.emit('Order.MAKING_STATUS', {
				orderMng: this._orderMng,
				makingStatus: status.key,
				t,
			})
		})
	}

	async _afterAssign(status, opts) {
		return null
	}
}

MakingStatusFlow.define({
	pending: {
		name: 'Pendiente',
		color: 'yellow',
	},
	awaitingAvalability: {
		name: 'Esperando disponibilidad de productos',
		color: 'orange',
	},
	onHold: {
		name: 'En espera de resolución',
		color: 'orange',
	},
	inProcess: {
		name: 'En proceso',
		color: 'orange',
	},
	readyForPacking: {
		name: 'En proceso',
		color: 'orange',
	},
	packing: {
		name: 'Preparando el paquete',
		color: 'orange',
	},
	ready: {
		name: 'Lista para entregar',
		color: 'amber',
	},
})

module.exports = MakingStatusFlow
