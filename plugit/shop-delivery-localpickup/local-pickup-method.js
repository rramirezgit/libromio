const { DeliveryMethod, DeliveryService } = require('#/shop-order')
const LocalPickupMethodStatusFlow = require('./local-pickup-method-status-flow')
const _optionsBuilders = []

class LocalPickupMethod extends DeliveryMethod {
	static get methodKey() {
		return 'LocalPickup'
	}

	static get methodName() {
		return 'Retiro por Sucursal'
	}

	getLocalPickupOptions() {
		return _optionsBuilders.map((fn) => fn(this._orderMng))
	}

	async getCheckoutData() {
		let options = this.getLocalPickupOptions().filter(({ enabled }) => enabled)
		return { options }
	}

	async getCheckoutConfirmData(input = {}) {
		let localPickupOption = this.getLocalPickupOptions().find((opt) => opt.key == input.key)
		if (!localPickupOption || !localPickupOption.enabled) return null
		return { option: localPickupOption }
	}

	async getOrderDeliveryData(input = {}) {
		let localPickupOption = this.getLocalPickupOptions().find((opt) => opt.key == input.key)
		if (!localPickupOption) return null
		let { key: optionKey, name: optionName, enabled, zipcode, ...data } = localPickupOption
		if (!enabled) return null
		let { methodKey, methodName } = LocalPickupMethod
		return {
			methodKey,
			methodName,
			optionKey,
			optionName,
			data,
			cost: 0,
			status: 'pending',
			zipcode,
		}
	}

	async getPosition() {
		return 2
	}

	get statusFlow() {
		return new LocalPickupMethodStatusFlow(this._orderMng)
	}

	// STATIC
	static registerOption(optionBuilder) {
		_optionsBuilders.push(optionBuilder)
	}
}

DeliveryService.registerMethod(LocalPickupMethod)

module.exports = LocalPickupMethod
