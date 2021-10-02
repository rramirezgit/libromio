const { DataTypes } = require('sequelize')
const moment = require('moment')
const { snakeCase, pascalCase } = require('case-anything')

const CustomTypes = {
	ID: () => ({
		autoIncrement: true,
		primaryKey: true,
		type: DataTypes.BIGINT(11).UNSIGNED,
	}),

	UUID: () => ({
		primaryKey: true,
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
	}),

	PRICE: () => ({
		type: DataTypes.DECIMAL(10, 2).UNSIGNED,
	}),

	NUMBER: () => ({
		type: DataTypes.DECIMAL(10, 2).UNSIGNED,
	}),

	FILE: () => ({
		type: DataTypes.STRING(600),
	}),

	M_DATETIME: (column) => ({
		type: DataTypes.DATE,
		set(value) {
			if (value) {
				value = moment(value).format('YYYY-MM-DD HH:mm:ss')
			}
			this.setDataValue(column, value)
		},
	}),

	M_DATE: (column) => ({
		type: DataTypes.DATEONLY,
		set(value) {
			if (value) {
				value = moment(value).format('YYYY-MM-DD')
			}
			this.setDataValue(column, value)
		},
	}),

	JSON: (column) => ({
		type: DataTypes.TEXT,
		get() {
			let value = this.getDataValue(column)
			if (!value) return value
			try {
				return JSON.parse(value)
			} catch (err) {
				return value
			}
		},
		set(value) {
			if (typeof value != 'string') {
				value = value ? JSON.stringify(value) : null
			}
			this.setDataValue(column, value)
		},
	}),
}

module.exports = CustomTypes
