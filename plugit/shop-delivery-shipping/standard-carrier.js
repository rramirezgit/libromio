const ShippingCarrier = require('./shipping-carrier')
const { db } = require('#/express')

class StandardCarrier extends ShippingCarrier {
	static get carrierKey() {
		return 'Standard'
	}

	static get carrierName() {
		return 'Standard'
	}

	static async getRatesKeys() {
		let [rows] = db
			.$rawQueryBuilder('SELECT')
			.col('DISTINCT(rateKey) AS rateKey')
			.table('StandardCarrierRate')
			.run()
		return rows.map((row) => row.rateKey)
	}

	async calculate(rateKey) {
		let rates = await db.StandardCarrierRate.findAll({
			where: { rateKey },
			order: [db._('-maxSize DESC'), db._('-maxWeight DESC')],
		})
		let totalSize = this._orderMng.calculateTotalSize()
		let totalWeight = this._orderMng.calculateTotalWeight()
		rates = rates.filter((rate) => {
			return (
				(rate.maxSize === null || rate.maxSize >= totalSize) &&
				(rate.maxWeight === null || rate.maxWeight >= totalWeight)
			)
		})

		if (!rates.length) return false

		let { rateName, costPerSize, costPerWeight, baseCost, fixedCost } = rates[0]
		let cost = 0
		if (fixedCost) {
			cost = fixedCost
		} else {
			if (costPerSize) {
				cost = Math.max(cost, costPerSize * totalSize)
			}
			if (costPerWeight) {
				cost = Math.max(cost, costPerWeight * totalWeight)
			}
			if (baseCost) {
				cost = Math.max(cost, baseCost)
			}
		}

		return { cost, data: { rateKey, rateName } }
	}
}

module.exports = StandardCarrier
