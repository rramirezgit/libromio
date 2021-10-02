const { DeliveryMethod, DeliveryService, AddressService } = require('#/shop-order')
const ShippingMethodStatusFlow = require('./shipping-method-status-flow')
const StandardCarrier = require('./standard-carrier')
const { db } = require('#/express')

const _carriers = {}

class ShippingMethod extends DeliveryMethod {
	static get methodKey() {
		return 'Shipping'
	}

	static get methodName() {
		return 'Envío a domicilio'
	}

	static registerCarrier(CarrierClass) {
		_carriers[CarrierClass.carrierKey] = CarrierClass
	}

	static async calculate(orderMng, zipcodeId) {
		let zonesIds = await AddressService.getZonesIdsByZipcode(zipcodeId)
		if (!zonesIds) return false
		let rateConfigs = await db.ShippingRateConfig.findAll({
			where: { zoneId: zonesIds },
			order: ['position'],
		})

		for (let rateConfig of rateConfigs) {
			let { carrierKey, rateKey } = rateConfig
			let CarrierClass = _carriers[carrierKey]
			if (!CarrierClass) continue
			let carrier = new CarrierClass(orderMng)
			let result = await carrier.calculate(rateKey)
			if (result !== false) {
				let { cost, data } = result
				return { cost, data, carrierKey, carrierName: CarrierClass.carrierName, rateKey }
			}
		}
		return false
	}

	async getCheckoutData() {
		return {}
	}

	async getCheckoutConfirmData(input = {}) {
		let { address } = input
		let { cost } = await this.calculate(address.zipcodeId)
		return { cost, address }
	}

	async getPosition() {
		return 1
	}

	async isEnabled() {
		return true
	}

	async calculate(zipcodeId) {
		return await ShippingMethod.calculate(this._orderMng, zipcodeId)
	}

	async getOrderDeliveryData(input = {}) {
		let { address } = input
		let { cost, carrierKey, carrierName, rateKey, data } = await this.calculate(address.zipcodeId)
		let { methodKey, methodName } = ShippingMethod
		return {
			methodKey,
			methodName,
			optionKey: carrierKey,
			optionName: carrierName,
			data: { ...data, rateKey, address },
			cost,
			status: 'pending',
			zipcode: address.zipcode.code,
		}
	}

	get statusFlow() {
		return new ShippingMethodStatusFlow(this._orderMng)
	}

	get carrier() {
		let carrierKey = this._orderMng.order.delivery.optionKey
		let CarrierClass = _carriers[carrierKey]
		if (!CarrierClass) return null
		return new CarrierClass(this._orderMng)
	}
}

ShippingMethod.registerCarrier(StandardCarrier)
DeliveryService.registerMethod(ShippingMethod)

module.exports = ShippingMethod
