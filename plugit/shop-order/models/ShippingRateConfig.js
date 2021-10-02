module.exports = (Model, DataTypes, CustomTypes) =>
	class ShippingRateConfig extends Model {
		static $props() {
			return {
				carrierKey: {
					type: DataTypes.STRING,
				},
				rateKey: {
					type: DataTypes.STRING,
				},
				position: {
					type: DataTypes.INTEGER.UNSIGNED,
				},
			}
		}

		static $joins(db, { belongsTo }) {
			belongsTo('zone', db.Zone, {
				onDelete: 'CASCADE',
				required: true,
			})
		}
	}
