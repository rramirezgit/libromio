const bcrypt = require('bcryptjs')
const { v } = require('#/utils')
const { capitalCase } = require('case-anything')

module.exports = (Model, DataTypes, CustomTypes) =>
	class User extends Model {
		static $props() {
			return {
				accountEmail: {
					type: DataTypes.STRING,
					unique: true,
					_filters: [(v) => v.toLowerCase()],
				},
				contactEmail: {
					type: DataTypes.STRING,
					_filters: [(v) => v.toLowerCase()],
				},
				firstname: {
					type: DataTypes.STRING,
					_filters: [capitalCase],
					allowNull: true,
				},
				lastname: {
					type: DataTypes.STRING,
					_filters: [capitalCase],
					allowNull: true,
				},
				password: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				phonePrefix: {
					type: DataTypes.STRING(10),
					set(value) {
						if (value) {
							value = `${value}`.trim()
							if (!value.startsWith('0')) value = `0${value}`
						}
						this.setDataValue('phonePrefix', value)
					},
					allowNull: true,
				},
				phoneNumber: {
					type: DataTypes.STRING(20),
					allowNull: true,
				},
				googleId: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				facebookId: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				addresses: {
					...CustomTypes.JSON('addresses'),
					allowNull: true,
				},
				blacklisted: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				rawPassword: {
					type: DataTypes.VIRTUAL,
					allowNull: true,
					set(value) {
						this.setDataValue('rawPassword', value)
						this.setDataValue('password', value && bcrypt.hashSync(value, 10))
					},
				},
				currentPassword: {
					type: DataTypes.VIRTUAL,
					allowNull: true,
				},
			}
		}

		static $config() {
			return { paranoid: true, timestamps: true }
		}

		static $rules(instance, db, { validateNames, validatePassword }) {
			return {
				accountEmail: [v.email(), v.unique(instance, 'accountEmail')],
				contactEmail: [v.email()],
				currentPassword: [
					v.if(validatePassword),
					v.required(),
					(value) => instance.comparePassword(value) || 'La contraseña actual es incorrecta',
				],
				rawPassword: [
					v.requiredIf(validatePassword || (!instance.googleId && !instance.facebookId)),
					v.ifNotEmpty(),
					v.minLen(6),
				],
				firstname: [v.if(validateNames), v.required(), v.minLen(2)],
				lastname: [v.if(validateNames), v.required(), v.minLen(2)],
				phonePrefix: [v.if(instance.phoneNumber), v.phonePrefix()],
				phoneNumber: [v.if(instance.phonePrefix), v.phoneNumber(instance.phonePrefix)],
			}
		}

		static $scheme_default() {
			return [
				'id',
				'accountEmail',
				'contactEmail',
				'firstname',
				'lastname',
				'phonePrefix',
				'phoneNumber',
				'blacklisted',
				'createdAt',
				'addresses',
			]
		}

		static $scheme_account() {
			return [
				'accountEmail',
				'firstname',
				'lastname',
				'phonePrefix',
				'phoneNumber',
				'contactEmail',
				'googleId',
				'facebookId',
			]
		}

		static $scope_favourites(builder) {
			return builder().join('userFavourites')
		}

		comparePassword(password) {
			return this.password && password && bcrypt.compareSync(password, this.password)
		}

		get fullname() {
			return `${this.firstname || ''} ${this.lastname || ''}`.trim()
		}
	}
