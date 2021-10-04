const ShippingCarrier = require('./shipping-carrier')
const ApiAndreani = require('./andreani-api')

class AndreaniCarrier extends ShippingCarrier {
	static get carrierKey() {
		return 'andreani'
	}

	static get carrierName() {
		return 'andreani'
	}

	static async getRatesKeys() {
		return ['andreani-api']
	}

	async calculate(rateKey, postalCode) {
		const totalSize = this._orderMng.calculateTotalSize()
		const totalWeight = this._orderMng.calculateTotalWeight()
		const CONTRATO = 300006611
		const rateName = ''
		const bultos = [
			{
				volumen: totalSize,
				kilos: totalWeight,
			},
		]
		try {
			const api = new ApiAndreani(CONTRATO)
			const { data } = await api.CalculateShippingCost(postalCode, bultos)
			const cost = data?.tarifaConIva?.total
			return { cost, data: { rateKey, rateName } }
		} catch (e) {
			return false
		}
	}
}

module.exports = AndreaniCarrier
