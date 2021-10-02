const _methods = {}

class PaymentService {
	static registerMethod(PaymentMethodClass) {
		_methods[PaymentMethodClass.methodKey] = PaymentMethodClass
	}

	static getMethodClass(methodKey) {
		return _methods[methodKey]
	}

	static getMethod(methodKey, orderMng) {
		let MethodClass = _methods[methodKey]
		if (!MethodClass) return null
		return new MethodClass(orderMng)
	}

	static async getSelectableMethods(orderMng) {
		let methodsData = []
		for (let MethodClass of Object.values(_methods)) {
			let method = new MethodClass(orderMng)
			if (await method.isEnabled()) {
				let methodData = {
					methodKey: MethodClass.methodKey,
					position: await method.getPosition(),
					checkoutData: await method.getCheckoutData(),
				}
				methodsData.push(methodData)
			}
		}
		methodsData.sort((a, b) => a.position - b.position)
		return methodsData
	}
}

module.exports = PaymentService
