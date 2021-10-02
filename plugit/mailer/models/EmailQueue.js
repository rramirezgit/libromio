module.exports = (Model, DataTypes, CustomTypes) =>
	class EmailQueue extends Model {
		static $props() {
			return {
				transportKey: {
					type: DataTypes.STRING,
				},
				message: {
					...CustomTypes.JSON('message'),
				},
				error: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				attempt: {
					type: DataTypes.INTEGER.UNSIGNED,
					defaultValue: 0,
				},
				consumeAt: {
					...CustomTypes.M_DATETIME('consumeAt'),
				},
			}
		}

		static $config() {
			return { timestamps: true, updatedAt: false }
		}
	}
