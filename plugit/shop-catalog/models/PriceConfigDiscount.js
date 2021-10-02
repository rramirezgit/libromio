const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class PriceConfigDiscount extends Model {
		static $props() {
			return {
				displayName: {
					type: DataTypes.STRING,
				},
				discountPct: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
				},
				priority: {
					type: DataTypes.INTEGER.UNSIGNED,
					defaultValue: 0,
				},
			}
		}

		static $init() {
			this.afterUpdate(async (instance) => {
				if (!instance.priceConfigId) {
					await instance.destroy()
				}
			})
		}

		static $joins(db, { belongsTo }) {
			belongsTo('collection', db.Collection, {
				onDelete: 'CASCADE',
			})
		}

		static $rules(instance) {
			return {
				displayName: [v.required()],
				discountPct: [v.required(), v.int({ negative: true }), v.lte(99)],
				priority: [v.ifNotEmpty(), v.int(), v.gte(0)],
			}
		}
	}
