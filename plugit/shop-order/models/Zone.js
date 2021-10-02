module.exports = (Model, DataTypes, CustomTypes) =>
	class Zone extends Model {
		static $props() {
			return {
				name: {
					type: DataTypes.STRING,
				},
				zipcodesIds: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				statesIds: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
			}
		}
	}
