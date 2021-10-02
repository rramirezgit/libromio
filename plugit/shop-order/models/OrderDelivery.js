module.exports = (Model, DataTypes, CustomTypes) =>
	class OrderDelivery extends Model {
		static $props() {
			return {
				methodKey: {
					type: DataTypes.STRING,
				},
				methodName: {
					type: DataTypes.STRING,
				},
				optionKey: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				optionName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				data: {
					...CustomTypes.JSON('data'),
					allowNull: true,
				},
				cost: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				discount: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				discountName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				total: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				status: {
					type: DataTypes.STRING,
					// provided by method
				},
				zipcode: {
					type: DataTypes.STRING(12),
				},
				externalData: {
					...CustomTypes.JSON('externalData'),
					allowNull: true,
				},
				externalReference: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			}
		}

		static $config() {
			return {
				timestamps: true,
				createdAt: false,
			}
		}

		static $joins(db, { belongsTo }) {
			belongsTo('order', db.Order, {
				required: true,
				onDelete: 'CASCADE',
			})
		}
	}
