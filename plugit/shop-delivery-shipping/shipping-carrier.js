class ShippingCarrier {
	static get carrierKey() {
		return ''
	}

	static get carrierName() {
		return ''
	}

	static async getRatesKeys() {
		return []
	}

	constructor(orderMng) {
		this._orderMng = orderMng
	}

	async calculate(rateKey) {
		return { cost: 0, data: {} }
	}
}

module.exports = ShippingCarrier
