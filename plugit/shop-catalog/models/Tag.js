module.exports = (Model, DataTypes, CustomTypes) =>
	class Tag extends Model {
		static $props() {
			return {
				name: {
					type: DataTypes.STRING,
				},
			}
		}

		static $config() {}
		static $joins() {}
	}
