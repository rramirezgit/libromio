const urlSlug = require('url-slug')

module.exports = (Model, DataTypes, CustomTypes) =>
	class AttrKey extends Model {
		static $props() {
			return {
				k: {
					type: DataTypes.STRING,
					set(value) {
						value = value || ''
						this.setDataValue('k', value)
						this.setDataValue('urlK', urlSlug(value))
					},
				},
				urlK: {
					type: DataTypes.STRING,
				},
				shopFilter: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
			}
		}

		static $config() {}

		static $joins(db, { hasMany }) {
			hasMany('values', db.AttrVal)
		}

		static $scope_combobox(builder) {
			return builder()
				.set({ attributes: ['k'] })
				.join('values', { attributes: ['v'] })
		}
	}
