const { v } = require('#/utils')
const moment = require('moment')

module.exports = (Model, DataTypes, CustomTypes) =>
	class Config extends Model {
		static $props() {
			return {
				keyname: {
					type: DataTypes.STRING,
				},
				fromDate: {
					...CustomTypes.M_DATE('fromDate'),
					allowNull: true,
				},
				toDate: {
					...CustomTypes.M_DATE('toDate'),
					allowNull: true,
				},
				data: {
					...CustomTypes.JSON('data'),
				},
				updatedBy: {
					type: DataTypes.STRING,
				},
			}
		}

		static $config() {
			return { timestamps: true }
		}

		static $scheme_admin() {
			return ['@all', 'status', 'active', 'componentAttrs', 'reference', 'referenceKey']
		}

		static $scheme_default() {
			return ['keyname', 'fromDate', 'toDate', 'data']
		}

		setData(key, value) {
			let data = this.data
			data[key] = value
			this.data = data
			return this
		}
	}
