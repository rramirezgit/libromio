module.exports = (Model, DataTypes, CustomTypes) =>
	class Zipcode extends Model {
		static $props() {
			return {
				code: {
					type: DataTypes.STRING(15),
				},
			}
		}

		static $joins(db, { belongsTo }) {
			belongsTo('state', db.State, {
				required: true,
				onDelete: 'CASCADE',
			})
		}

		static $scope_default(builder) {
			return builder().join('state.country')
		}
	}
