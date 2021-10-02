const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class OrderBuyer extends Model {
		static $props() {
			return {
				firstname: {
					type: DataTypes.STRING,
				},
				lastname: {
					type: DataTypes.STRING,
				},
				email: {
					type: DataTypes.STRING,
				},
				phonePrefix: {
					type: DataTypes.STRING(10),
					set(value) {
						if (value) {
							value = `${value}`.trim()
							if (!value.startsWith('0')) value = `0${value}`
						}
						this.setDataValue('phonePrefix', value)
					},
				},
				phoneNumber: {
					type: DataTypes.STRING(20),
				},
				/*phone2: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				idNumber: {
					type: DataTypes.STRING(30),
					allowNull: true,
				},*/
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
		}

		static $rules(instance) {
			return {
				firstname: [v.required(), v.minLen(2)],
				lastname: [v.required(), v.minLen(2)],
				email: [v.required(), v.email()],
				phonePrefix: [v.required(), v.phonePrefix()],
				phoneNumber: [v.required(), v.phoneNumber(instance.phonePrefix)],
			}
		}
	}
