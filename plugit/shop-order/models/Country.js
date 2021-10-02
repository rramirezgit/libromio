module.exports = (Model, DataTypes, CustomTypes) =>
	class Country extends Model {
		static $props() {
			return {
				name: {
					type: DataTypes.STRING,
				},
				isoName: {
					type: DataTypes.STRING(2),
				},
			}
		}
	}
