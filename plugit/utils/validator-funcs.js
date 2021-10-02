const sizeOf = require('image-size')
const bcrypt = require('bcryptjs')
const moment = require('moment')
const { Op } = require('sequelize')
const parseNum = require('./parse-num')

const v = {
	// SPECIAL funcs
	ifNotEmpty: () => (value) => {
		if (value === undefined || value === null || (typeof value == 'string' && !value.trim())) {
			return { stopValidation: true }
		}
		return true
	},
	if: (condition) => (value) => {
		let result = typeof condition == 'function' ? condition(value) : condition
		return !!result ? true : { stopValidation: true }
	},
	requiredIf: (condition) => (value) => {
		let result = typeof condition == 'function' ? condition(value) : condition
		if (result) {
			return v.required()(value)
		} else {
			return v.ifNotEmpty()(value)
		}
	},
	// VALIDATION funcs
	required: () => (value) => {
		if (
			value === undefined ||
			value === null ||
			(typeof value == 'string' && !value.trim()) ||
			(Array.isArray(value) && !value.length)
		) {
			return 'Requerido'
		}
		return true
	},
	int:
		(opts = {}) =>
		(value) => {
			let re = opts.negative ? /^-?[0-9]+$/ : /^[0-9]+$/
			return re.test(value) || 'Ingresa un número válido (sin decimales)'
		},
	number: () => (value) => {
		return parseNum(value) !== false || 'Ingresa un número válido'
	},
	price: () => (value) => {
		return /^[0-9]+(\.[0-9]{0,2})?$/.test(value) || 'Ingresa un monto válido (máx. 2 decimales)'
	},
	in: (opts) => (value) => {
		return opts.includes(value) || 'Inválido'
	},
	unique: (modelInstance, prop) => async (value) => {
		let where = { [prop]: value }
		if (modelInstance.id) {
			where.id = { [Op.ne]: modelInstance.id }
		}
		let total = await modelInstance.constructor.count({
			where,
			paranoid: false,
		})
		return total == 0 || 'Ya fue registrado'
	},
	validModel: (ModelClass, prop) => async (value) => {
		prop = prop || 'id'
		let total = await ModelClass.count({ where: { [prop]: value } })
		return total > 0 || 'El elemento es inexistente o ha sido eliminado'
	},
	findModel:
		(ModelClass, prop, bodyModelProp) =>
		async (value, { req }) => {
			let modelObj = await ModelClass.findOne({ where: { [prop]: value } })
			if (!modelObj) return 'Inválido'
			req.body[bodyModelProp] = modelObj
			return true
		},
	minLen: (min) => (value) => {
		return (value && value.trim().length >= min) || `Debe contener mínimo ${min} carateres`
	},
	maxLen: (max) => (value) => {
		return (value && value.trim().length <= max) || `Debe contener máximo ${max} carateres`
	},
	gt: (num) => (value) => {
		return value > num || `Debe ser mayor a ${num}`
	},
	lt: (num) => (value) => {
		return value < num || `Debe ser menor a ${num}`
	},
	gte: (num) => (value) => {
		return value >= num || `Debe ser mayor o igual a ${num}`
	},
	lte: (num) => (value) => {
		return value <= num || `Debe ser menor o igual a ${num}`
	},
	between: (from, to) => (value) => {
		return (value >= from && value <= to) || `Debe estar entre ${from} y ${to}`
	},
	email: () => (value) => {
		return (
			/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value) ||
			'Ingresa un email válido'
		)
	},
	urlSlug: () => (value) => {
		return /^[a-z0-9-]+$/.test(value)
			? true
			: 'Ingresa solo caracteres válidos para una URL. Letras minúsculas (a-z), números (0-9) o guiones medios (-). No utilices tildes, ni "ñ", ni símbolos.'
	},
	re:
		(re, errMessage = null) =>
		(value) => {
			return value.match(re) ? true : errMessage || 'Inválido'
		},
	phonePrefix: () => (value) => {
		return v.re(/^0[1-3]{1}[0-9]{1,3}$/)(value || '')
	},
	phoneNumber: (prefix) => (value) => {
		let prelen = prefix ? prefix.length : 0
		value = value || ''
		if (prelen >= 3 && prelen <= 5) {
			let diff = 11 - prelen
			if (value.match(/^[0-9]+$/) && value.length == diff) return true
			else return 'Inválido'
		} else {
			return v.re(/^[0-9]{6,8}$/)(value)
		}
	},
	phone: () => (value) => {
		return value.match(/^[0-9]{8,15}$/) ? true : 'Debe tener entre 8 y 15 números'
	},
	cuit: () => (value) => {
		let re = /^[0-9]{2}-[0-9]{7,9}-[0-9]{1}$/
		return value && value.match(re) ? true : 'Debe tener el formato XX-XXXXXXXX-X'
	},
	dni: () => (value) => {
		let re = /^[1-9]{1}[0-9]{6,7}$/
		return value && value.match(re)
			? true
			: 'El dni es inválido. Solo están permitidos caracteres numéricos.'
	},
	hexColor: () => (value) => {
		return /^#[0-F]{6}$/.test(value) || 'Ingresa un color en formato "#FFFFFF"'
	},
	notExpired: () => (value) => {
		return moment(value).isAfter(moment()) || 'Debe ingresar una fecha válida'
	},
	passwordCompare: (hash) => (value) => {
		return bcrypt.compareSync(value, hash) || 'La contraseña es incorrecta'
	},
	file: {
		maxSize: (maxKb) => (file) => {
			return (
				file.size / 1024 <= maxKb ||
				`${file.name}: El archivo supera el tamaño máximo permitido de ${maxKb} KB.`
			)
		},
		validTypes:
			(...types) =>
			(file) => {
				let _types = [...types]
				if (_types.includes('image'))
					_types = _types.filter((type) => type != 'image').concat('png', 'jpg', 'jpeg', 'webp')
				let match = _types.includes(file.type) || _types.includes(file.type.split('/')[1])
				if (match) return true
				return `${
					file.name
				}: Tipo de archivo inválido. Solo están permitidos los archivos de tipo ${_types.join(', ')}.`
			},
		isImage: () => v.file.validTypes('image'),
		dimension:
			({ w, h, maxW, maxH, minW, minH }) =>
			(file) => {
				let isImage = v.file.isImage()(file)
				if (isImage !== true) return isImage
				let { width, height } = sizeOf(file.path)
				let rd = []
				let success = true
				if (w !== undefined) {
					rd.push(`Ancho ${w}px`)
					if (width != w) success = false
				} else {
					if (minW !== undefined) {
						rd.push(`Ancho mínimo ${minW}px`)
						if (width < minW) success = false
					}
					if (maxW !== undefined) {
						rd.push(`Ancho máximo ${maxW}px`)
						if (width > maxW) success = false
					}
				}
				if (h !== undefined) {
					rd.push(`Alto ${h}px`)
					if (height != h) success = false
				} else {
					if (minH !== undefined) {
						rd.push(`Alto mínimo ${minH}px`)
						if (height < minH) success = false
					}
					if (maxH !== undefined) {
						rd.push(`Alto máximo ${maxH}px`)
						if (height > maxH) success = false
					}
				}
				if (success) return true
				return `${file.name}: La imagen no tiene las dimensiones requeridas (${rd.join(' - ')})`
			},
	},
}

module.exports = v
