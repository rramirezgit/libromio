const MPService = require('./mp-service')
const { PaymentMethod, PaymentService } = require('#/shop-order')
const { ApiRes } = require('#/utils')
const MercadoPagoMethodStatusFlow = require('./mercado-pago-method-status-flow')

class MercadoPagoMethod extends PaymentMethod {
	static get methodKey() {
		return 'MercadoPago'
	}

	static get methodName() {
		return 'Mercado Pago'
	}

	async getCheckoutData() {
		return {}
	}

	async getCheckoutConfirmData() {
		return {}
	}

	async getOrderPaymentData(input) {
		let { methodKey, methodName } = MercadoPagoMethod
		return {
			methodKey,
			methodName,
			data: null,
			status: 'pending',
			amount: this._orderMng.order.total,
		}
	}

	async resolveOrderConfirmationResponse(input = {}) {
		let [payment] = this._orderMng.order.payments
		let { initPoint } = await MPService.createPreference(this._orderMng, payment)
		return ApiRes().redirect(initPoint)
	}

	get statusFlow() {
		return new MercadoPagoMethodStatusFlow(this._orderMng)
	}
}

PaymentService.registerMethod(MercadoPagoMethod)

module.exports = MercadoPagoMethod
