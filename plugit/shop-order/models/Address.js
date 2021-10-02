const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class Address extends Model {
		static $props() {
			return {
				title: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				street: {
					type: DataTypes.STRING,
				},
				streetNumber: {
					type: DataTypes.STRING,
				},
				apartment: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				floor: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				comment: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				intersection1: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				intersection2: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				city: {
					type: DataTypes.STRING,
				},
			}
		}

		static $joins(db, { belongsTo }) {
			belongsTo('user', db.User, {
				required: true,
				onDelete: 'CASCADE',
			})
			belongsTo('zipcode', db.Zipcode, {
				required: true,
				onDelete: 'CASCADE',
			})
		}

		static $rules(instance, db) {
			return {
				title: [v.ifNotEmpty(), v.maxLen(30)],
				street: [v.required(), v.maxLen(50)],
				streetNumber: [v.required(), v.maxLen(50)],
				apartment: [v.ifNotEmpty(), v.maxLen(50)],
				floor: [v.ifNotEmpty(), v.maxLen(50)],
				comment: [v.ifNotEmpty(), v.maxLen(250)],
				intersection1: [v.required(), v.maxLen(50)],
				intersection2: [v.required(), v.maxLen(50)],
				city: [v.required(), v.maxLen(50)],
				zipcodeId: [v.required(), v.validModel(db.Zipcode)],
				userId: [v.ifNotEmpty(), v.validModel(db.User)],
			}
		}

		static $scope_default(builder) {
			return builder().join('zipcode.state.country')
		}
	}
