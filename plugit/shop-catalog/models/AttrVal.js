const urlSlug = require('url-slug')

module.exports = (Model, DataTypes, CustomTypes) =>
	class AttrVal extends Model {
		static $props() {
			return {
				v: {
					type: DataTypes.STRING,
					set(value) {
						value = value || ''
						this.setDataValue('v', value)
						this.setDataValue('urlV', urlSlug(value))
					},
				},
				urlV: {
					type: DataTypes.STRING,
				},
			}
		}

		static $config() {}

		static $joins(db, { belongsTo }) {
			belongsTo('attrKey', db.AttrKey)
		}
	}
