const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class ProductVariantPrice extends Model {
		static $props() {
			return {
				basePrice: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				modifPrice: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				configDiscountPct: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
				},
				extraDiscountPct: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
				},
				discountPct: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
				},
				prevPrice: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				price: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				/*isMinPrice: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},*/
			}
		}

		static $config() {}

		static $joins(db, { belongsTo }) {
			belongsTo('variant', db.ProductVariant, {
				onDelete: 'CASCADE',
			})
			belongsTo('priceConfig', db.PriceConfig, {
				onDelete: 'CASCADE',
			})
			belongsTo('discountConfig', db.PriceConfigDiscount, {
				onDelete: 'SET NULL',
			})
		}

		static $rules(instance) {
			return {
				basePrice: [v.required(), v.price()],
				extraDiscountPct: [v.ifNotEmpty(), v.int({ negative: true }), v.lte(99)],
			}
		}
	}
