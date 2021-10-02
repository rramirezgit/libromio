const { capitalCase } = require('case-anything')
const urlSlug = require('url-slug')
const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class Category extends Model {
		static $props() {
			return {
				name: {
					type: DataTypes.STRING,
					_filters: [capitalCase],
				},
				urlName: {
					type: DataTypes.STRING,
					_filters: [urlSlug],
				},
				fullUrlName: {
					type: DataTypes.STRING,
					_filters: [urlSlug],
				},
				pos: {
					type: DataTypes.INTEGER.UNSIGNED,
				},
				menuPos: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: true,
				},
				hasProducts: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				defaultAttrs: {
					...CustomTypes.JSON('defaultAttrs'),
					allowNull: true,
				},
			}
		}

		static $config() {}
		static $rules(instance, db) {
			return {
				name: [v.required()],
				menuPos: [v.ifNotEmpty(), v.int(), v.gt(0)],
				parentId: [
					v.ifNotEmpty(),
					v.validModel(db.Category),
					(value) => {
						if (instance.id && value == instance.id) {
							return 'No puedes asignar la misma categoría como padre'
						}
						return true
					},
				],
			}
		}

		static $joins(db, { belongsTo, hasMany }) {
			hasMany('children', db.Category, {
				constraints: false,
				foreignKey: 'parentId',
				onDelete: 'CASCADE',
			})
			belongsTo('parent', db.Category, {
				foreignKey: 'parentId',
				onDelete: 'CASCADE',
			})
		}

		static $scheme_default() {
			return ['@all', 'children']
		}
	}
