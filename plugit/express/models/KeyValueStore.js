module.exports = (Model, DataTypes, CustomTypes) =>
	class KeyValueStore extends Model {
		static $props() {
			return {
				k: {
					type: DataTypes.STRING,
				},
				v: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
			}
		}
	}
