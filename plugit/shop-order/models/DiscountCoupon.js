const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class DiscountCoupon extends Model {
		static $props() {
			return {
				code: {
					type: DataTypes.STRING,
				},
				consumable: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				dueDate: {
					...CustomTypes.M_DATE('dueDate'),
					allowNull: true,
				},
				qty: {
					type: DataTypes.INTEGER.UNSIGNED,
					defaultValue: 0,
				},
				consumedQty: {
					type: DataTypes.INTEGER.UNSIGNED,
					defaultValue: 0,
				},
			}
		}

		static $config() {
			return {}
		}

		static $joins(db, { belongsTo }) {
			belongsTo('discountConfig', db.DiscountConfig, {
				allowNull: false,
				required: true,
				onDelete: 'RESTRICT',
			})
		}

		static $rules() {
			return {}
		}
	}
