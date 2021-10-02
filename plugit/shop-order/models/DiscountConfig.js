const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class DiscountConfig extends Model {
		static $props() {
			return {
				keyname: {
					type: DataTypes.STRING,
				},
				itemsDiscountPct: {
					type: DataTypes.INTEGER.UNSIGNED,
					defaultValue: 0,
				},
				itemsDiscountLimit: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				itemsLimitMode: {
					type: DataTypes.STRING,
					defaultValue: 'per_unit', //per_unit, per_item, all
				},
				itemsCombinationMode: {
					type: DataTypes.STRING,
					defaultValue: 'all', //all, none,
				},
				deliveryDiscountPct: {
					type: DataTypes.INTEGER.UNSIGNED,
					defaultValue: 0,
				},
				deliveryDiscountLimit: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				fullOrderDiscountPct: {
					type: DataTypes.INTEGER.UNSIGNED,
					defaultValue: 0,
				},
				fullOrderDiscountLimit: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
			}
		}

		static $config() {
			return {}
		}

		static $joins(db, { belongsTo }) {
			belongsTo('collection', db.Collection, {
				onDelete: 'SET NULL',
			})
		}

		static $rules() {
			return {}
		}
	}
