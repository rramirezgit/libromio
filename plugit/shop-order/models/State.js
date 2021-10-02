module.exports = (Model, DataTypes, CustomTypes) =>
	class State extends Model {
		static $props() {
			return {
				name: {
					type: DataTypes.STRING,
				},
				isoName: {
					type: DataTypes.STRING,
				},
			}
		}

		static $joins(db, { belongsTo }) {
			belongsTo('country', db.Country, {
				required: true,
				onDelete: 'CASCADE',
			})
		}

		static $scope_default(builder) {
			return builder().join('country')
		}
	}
