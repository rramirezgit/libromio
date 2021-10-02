const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class PriceConfig extends Model {
		static $props() {
			return {
				keyname: {
					type: DataTypes.STRING,
				},
				relativePct: {
					type: DataTypes.DECIMAL(10, 2),
					defaultValue: 0,
				},
			}
		}

		static $config() {}

		static $joins(db, { belongsTo, hasMany }) {
			belongsTo('relativeTo', db.PriceConfig, {
				onDelete: 'SET NULL',
				foreignKey: 'relativeToId',
			})
			hasMany('discounts', db.PriceConfigDiscount, {
				onDelete: 'CASCADE',
			})
		}

		static $scope_full(builder) {
			return builder()
				.join('relativeTo')
				.join('discounts')
				.order('id')
				.order('discounts.priority', false)
		}

		static $rules(instance) {
			return {
				keyname: [v.required(), v.maxLen(20)],
				relativePct: [v.number()],
				relativeToId: [
					v.ifNotEmpty(),
					v.validModel(this),
					(value) => {
						return value == instance.id ? 'La configuración no puede ser relativa a sí misma' : true
					},
					async (value) => {
						if (!instance.id) return true
						let relConfig = await this.findByPk(value)
						if (!relConfig.relativeToId) return true
						return relConfig.relativeToId == instance.id
							? 'Referencia circular: No se puede asignar una configuración que es relativa a esta configuración.'
							: true
					},
				],
			}
		}
	}
