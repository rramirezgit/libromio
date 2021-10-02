module.exports = (Model, DataTypes, CustomTypes) =>
	class OrderPayment extends Model {
		static $props() {
			return {
				id: CustomTypes.UUID(),
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
				amount: {
					...CustomTypes.PRICE(),
				},
				status: {
					type: DataTypes.STRING,
					// provided by method
				},
				paid: {
					type: DataTypes.BOOLEAN,
				},
				paidAt: {
					...CustomTypes.M_DATETIME('paidAt'),
					allowNull: true,
				},
				refunded: {
					type: DataTypes.BOOLEAN,
				},
				refundedAt: {
					...CustomTypes.M_DATETIME('refundedAt'),
					allowNull: true,
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
			}
		}

		static $joins(db, { belongsTo }) {
			belongsTo('order', db.Order, {
				required: true,
				onDelete: 'CASCADE',
			})
		}
	}
