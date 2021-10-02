class PaymentMethod {
	constructor(orderMng) {
		this._orderMng = orderMng
	}

	static get methodKey() {
		return ''
	}

	static get methodName() {
		return ''
	}

	async getCheckoutData() {
		return {}
	}

	async getCheckoutConfirmData() {
		return {}
	}

	async isEnabled() {
		return true
	}

	async getPosition() {
		return 0
	}

	async getOrderPaymentData(input = {}) {
		return {
			methodKey: '',
			methodName: '',
			optionKey: '',
			optionName: '',
			data: {},
			status: '',
		}
	}

	async resolveOrderConfirmationResponse() {}
}

module.exports = PaymentMethod
