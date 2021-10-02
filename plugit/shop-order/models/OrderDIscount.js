const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class OrderDiscount extends Model {
		static $props() {
			return {
				triggerType: {
					type: DataTypes.STRING,
				},
				triggerKey: {
					type: DataTypes.STRING,
				},
				discountName: {
					type: DataTypes.STRING,
				},
				itemsDiscount: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				deliveryDiscount: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				fullOrderDiscount: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
			}
		}

		static $config() {
			return {}
		}

		static $joins(db, { belongsTo }) {
			belongsTo('order', db.Order, {
				required: true,
				onDelete: 'CASCADE',
			})
			belongsTo('discountConfig', db.DiscountConfig, {
				onDelete: 'SET NULL',
			})
		}

		static $rules() {
			return {}
		}
	}
