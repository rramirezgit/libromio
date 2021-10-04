const { DeliveryMethodStatusFlow } = require('#/shop-order')

class ShippingMethodStatusFlow extends DeliveryMethodStatusFlow {
	static _statuses = {}
}

ShippingMethodStatusFlow.define({
	pending: {
		name: 'Pendiente',
		color: 'yellow',
		flowsTo: ['sent'],
	},
	sent: {
		name: 'Enviada',
		color: 'success',
		flowsTo: ['onTheWay', 'delivered', 'returned'],
	},
	onTheWay: {
		name: 'En camino',
		color: 'success',
		flowsTo: ['sent', 'delivered', 'returned'],
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

module.exports = ShippingMethodStatusFlow
