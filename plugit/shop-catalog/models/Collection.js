//const moment = require('moment')
//const { Op } = require('sequelize')
const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class Collection extends Model {
		static $props() {
			return {
				keyname: {
					type: DataTypes.STRING(50),
				},
				filters: {
					...CustomTypes.JSON('filters'),
				},
			}
		}

		static $rules(instance) {
			return {
				keyname: [v.required(), v.unique(instance, 'keyname'), v.maxLen(30)],
				filters: [
					v.required(),
					async (value) => {
						let errors = {}
						for (let [i, filter] of value.entries()) {
							errors[`filters.${i}.type`] = await v.validate(filter.type, v.required())
							errors[`filters.${i}.op`] = await v.validate(filter.op, v.required())
							if (Array.isArray(filter.val) && !filter.val.length) {
								filter.val = null
							}
							errors[`filters.${i}.val`] = await v.validate(filter.val, v.required())
						}
						return errors
					},
				],
			}
		}

		static $joins(db, { belongsToMany }) {
			belongsToMany('products', db.Product, {
				onDelete: 'CASCADE',
				through: db.CollectionHasProduct,
			})
		}

		/*static $scope_currentConfig(builder) {
			return () => {
				let today = moment().toDate()
				return builder()
					.join('currentConfig')
					.joinWhere('currentConfig', {
						[Op.or]: [
							{
								fromDate: { [Op.lte]: today },
								toDate: null,
							},
							{
								fromDate: { [Op.lte]: today },
								toDate: { [Op.gte]: today },
							},
						],
					})
					.order('currentConfig.fromDate', false)
					.order('currentConfig.toDate')
					.get()
			}
		}*/
	}
