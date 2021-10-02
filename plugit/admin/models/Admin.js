const bcrypt = require('bcryptjs')
const PermissionsService = require('../services/permissions-service')
const { v } = require('#/utils')
const { capitalCase, snakeCase } = require('case-anything')

module.exports = (Model, DataTypes, CustomTypes) =>
	class Admin extends Model {
		static $props() {
			return {
				username: {
					type: DataTypes.STRING,
					unique: true,
					_filters: [snakeCase],
				},
				email: {
					type: DataTypes.STRING,
					unique: true,
					_filters: [(v) => v.toLowerCase()],
				},
				firstname: {
					type: DataTypes.STRING,
					_filters: [capitalCase],
				},
				lastname: {
					type: DataTypes.STRING,
					_filters: [capitalCase],
				},
				password: {
					type: DataTypes.STRING,
					_filters: [(v) => bcrypt.hashSync(v, 10)],
				},
				permissions: {
					type: DataTypes.STRING,
					get() {
						return this.getDataValue('permissions')
							.split(',')
							.map(PermissionsService.get)
							.filter((p) => !!p)
					},
					set(value) {
						if (Array.isArray(value)) value = value.join(',')
						this.setDataValue('permissions', value)
					},
				},
				lastLoginAt: {
					...CustomTypes.M_DATETIME('lastLoginAt'),
					allowNull: true,
				},
				tokenExpiresAt: {
					...CustomTypes.M_DATETIME('tokenExpiresAt'),
					allowNull: true,
				},
				token: {
					type: DataTypes.STRING,
					allowNull: true,
					set(value) {
						this.setDataValue('token', bcrypt.hashSync(value, 10))
					},
				},
				remember: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				updatedBy: {
					type: DataTypes.STRING,
				},
			}
		}

		static $config() {
			return { paranoid: true, timestamps: true }
		}

		static $joins() {}

		static $rules(instance) {
			return {
				username: [v.required(), v.unique(instance, 'username')],
				email: [v.email(), v.unique(instance, 'email')],
				firstname: v.required(),
				lastname: v.required(),
				password: [v.if(!instance.id), v.required()],
			}
		}

		static $scheme_default() {
			return ['id', 'username', 'email', 'firstname', 'lastname', 'updatedBy', 'permissions']
		}

		comparePassword(password) {
			return bcrypt.compareSync(password, this.password)
		}
	}
