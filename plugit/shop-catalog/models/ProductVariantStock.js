const { v } = require('#/utils')
const Availability = require('../services/stock-availability')

module.exports = (Model, DataTypes, CustomTypes) =>
	class ProductVariantStock extends Model {
		static $props() {
			return {
				qty: {
					...CustomTypes.NUMBER(),
					defaultValue: 0,
				},
				deferredDelivery: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
				availabilityDate: {
					...CustomTypes.M_DATE('availabilityDate'),
					allowNull: true,
				},
				maxBuyableQty: {
					...CustomTypes.NUMBER(),
					allowNull: true,
				},
				infiniteQty: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				availability: {
					type: DataTypes.ENUM(Object.values(Availability)),
				},
			}
		}

		static $config() {}

		static $joins(db, { belongsTo }) {
			belongsTo('variant', db.ProductVariant, {
				onDelete: 'CASCADE',
			})
		}

		static $rules() {
			return {
				qty: [v.required(), v.int(), v.gte(0)],
				deferredDelivery: [v.ifNotEmpty(), v.gte(1)],
				maxBuyableQty: [v.ifNotEmpty(), v.gte(1)],
			}
		}
	}
