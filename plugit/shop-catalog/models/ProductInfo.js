module.exports = (Model, DataTypes, CustomTypes) =>
	class ProductInfo extends Model {
		static $props() {
			return {
				description: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
			}
		}

		static $config() {}

		static $joins() {}

		static $scheme_default() {
			return ['description']
		}
	}
