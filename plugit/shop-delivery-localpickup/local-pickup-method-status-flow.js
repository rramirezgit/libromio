const { DeliveryMethodStatusFlow } = require('#/shop-order')

class LocalPickupMethodStatusFlow extends DeliveryMethodStatusFlow {
	static _statuses = {}
}

LocalPickupMethodStatusFlow.define({
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
			await this._orderMng.setDeliveryStatus('delivered')
		},
	},
	returned: {
		name: 'Devuelto',
		color: 'purple',
		flowsTo: false,
		async afterAssign() {
			await this._orderMng.setDeliveryStatus('returned')
		},
	},
})

module.exports = LocalPickupMethodStatusFlow
