const fs = require('fs')
const dottie = require('dottie')
const funcs = require('./validator-funcs')

const make = (obj, goNextMid) => async (req, res, next) => {
	let _obj = typeof obj === 'function' ? await obj(req, res) : { ...obj }

	let allErrors = {}
	let allSuccess = true
	for (let [fieldKey, validators] of Object.entries(_obj)) {
		try {
			let { src, field } = _getSrcAndField(fieldKey)
			let values = dottie.get(req[src], field)
			let result = validate(values, validators, { field, req, res })

			if (result !== true) {
				allSuccess = false
				let errorField = field.replace(/\[\]$/, '')
				allErrors[errorField] = result
			}
		} catch (err) {
			return next(err)
		}
	}

	if (allSuccess) {
		next()
	} else {
		_deleteAllTempUploadedFiles(req.files)
		if (goNextMid !== false) {
			res.flash.validations(allErrors).json()
		} else {
			req.validation = allErrors
			next()
		}
	}
}

const validate = async (value, validators, validatorsExtraArgs) => {
	validators = Array.isArray(validators) ? validators : [validators]

	for (let fn of validators) {
		if (typeof fn != 'function') continue
		let result = await fn(value, validatorsExtraArgs)
		if (result === true || !result) continue
		else if (typeof result === 'object' && result.stopValidation) return true
		else return result
	}

	return true
}

const each =
	(...validators) =>
	async (arr) => {
		for (let value of arr) {
			let result = await validate(value, validators)
			if (result !== true) return result
		}
		return true
	}

const validateAll = async (obj, keyValidatorsObj) => {
	let errors = {}
	for (let [key, validators] of Object.entries(keyValidatorsObj)) {
		let value = dottie.get(obj, key)
		let results = await validate(value, validators)
		if (typeof results != 'object') results = { [key]: results }
		for (let [k, result] of Object.entries(results)) {
			if (result !== true) {
				errors[k] = result
			}
		}
	}
	return Object.keys(errors).length == 0 || errors
}

function _getSrcAndField(fieldKey) {
	let src = 'body'
	let field = fieldKey
	if (fieldKey.includes('|')) {
		let spl = fieldKey.split('|')
		field = spl[1]
		switch (spl[0]) {
			case 'q':
				src = 'query'
				break
			case 'p':
				src = 'params'
				break
			case 'f':
				src = 'files'
				break
			case 'b':
			default:
				src = 'body'
				break
		}
	}
	return { src, field }
}

function _deleteAllTempUploadedFiles(files) {
	Object.values(files).forEach((file) => {
		let _files = Array.isArray(file) ? file : [file]
		_files.forEach((_file) => fs.unlinkSync(_file.path))
	})
}

module.exports = {
	make,
	validate,
	validateAll,
	each,
	...funcs,
}
