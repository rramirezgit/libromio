module.exports = (Model, DataTypes, CustomTypes) =>
	class StandardCarrierRate extends Model {
		static $props() {
			return {
				rateKey: {
					type: DataTypes.STRING,
				},
				rateName: {
					type: DataTypes.STRING,
				},
				maxSize: {
					...CustomTypes.NUMBER(),
					allowNull: true,
				},
				maxWeight: {
					...CustomTypes.NUMBER(),
					allowNull: true,
				},
				costPerSize: {
					...CustomTypes.PRICE(),
					allowNull: true,
				},
				costPerWeight: {
					...CustomTypes.PRICE(),
					allowNull: true,
				},
				baseCost: {
					...CustomTypes.PRICE(),
					allowNull: true,
				},
				fixedCost: {
					...CustomTypes.PRICE(),
					allowNull: true,
				},
			}
		}
	}
