const { PaymentMethodStatusFlow } = require('#/shop-order')

class MercadoPagoMethodStatusFlow extends PaymentMethodStatusFlow {
	static _statuses = {}
}

MercadoPagoMethodStatusFlow.define({
	pending: {
		name: 'Pendiente',
		color: 'yellow',
		flowsTo: ['paid'],
	},
	paid: {
		name: 'Pago acreditado',
		color: 'success',
		flowsTo: ['refunded'],
		beforeAssign(opts) {
			opts.data.paid = true
		},
	},
	refunded: {
		name: 'Dinero devuelto',
		color: 'purple',
		flowsTo: false,
		beforeAssign(opts) {
			opts.data.refunded = true
		},
		/*canAssign() {
			//return this._orderMng.deliveryStatusFlow.is('returned', 'pending')
		},*/
	},
})

module.exports = MercadoPagoMethodStatusFlow
