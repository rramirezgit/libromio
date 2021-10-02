const { mapKeys } = require('lodash')

const ApiRes = () => {
	let _data = {},
		_success = true,
		_validation = null,
		_message = null,
		_redirect = null,
		_req = null,
		_res = null

	const apiRes = {}

	apiRes.setContext = (req, res) => {
		_req = req
		_res = res
		return apiRes
	}

	apiRes.data = (key, value) => {
		if (!key) {
			return apiRes.getData()
		}
		if (typeof key == 'object') {
			Object.assign(_data, key)
		} else {
			_data[key] = value
		}
		return apiRes
	}

	apiRes.getData = () => {
		return { ..._data }
	}

	apiRes.validation = (key, value, mapKeysFn) => {
		if (!key) return apiRes.getValidation()

		let obj = null
		if (typeof key == 'object' && Object.values(key).length) {
			obj = key
			if (value) {
				mapKeysFn = value
			}
		} else if (typeof key == 'string' && value) {
			obj = { [key]: value }
		}
		if (obj) {
			_validation = _validation || {}
			if (mapKeysFn) {
				if (typeof mapKeysFn == 'function') {
					obj = mapKeys(obj, (value, key) => mapKeysFn(key))
				} else if (typeof mapKeysFn == 'string') {
					obj = mapKeys(obj, (value, key) => `${mapKeysFn}.${key}`)
				}
			}
			Object.assign(_validation, obj)
			_success = false
		}
		return apiRes
	}

	apiRes.getValidation = () => {
		return { ..._validation }
	}

	let _parseMessageParam = (message) => {
		if (typeof message == 'string') {
			return { text: message }
		} else if (typeof message == 'number') {
			return { code: message }
		} else if (typeof message == 'object') {
			return message
		}
		return null
	}

	apiRes.message = (message = { type, title, text, description, code }) => {
		if (message === undefined) return _message
		_message = _parseMessageParam(message)
		return apiRes
	}

	apiRes.error = (message) => {
		if (message === undefined && !_success) {
			return _message
		}
		_success = false
		message = _parseMessageParam(message)
		if (message) {
			message.type = 'error'
			apiRes.message(message)
		}
		return apiRes
	}

	apiRes.redirect = (to) => {
		if (!_req || !_res) {
			_redirect = to
			return apiRes
		}
		if (_req.xhr) {
			_res.json({ redirect: to })
		} else {
			_res.redirect(to)
		}
	}

	apiRes.get = () => {
		if (_redirect) {
			return { redirect: _redirect }
		}
		let obj = {
			data: _data,
			success: _success,
		}
		if (_message) obj.message = _message
		if (_validation) obj.validation = _validation
		return obj
	}

	apiRes.filter = async (fn) => {
		await fn(apiRes.get())
		return apiRes
	}

	apiRes.isSuccess = () => !!_success

	apiRes.json = () => {
		if (!_req || !_res) return
		_res.json(apiRes.get())
	}

	apiRes.hasErrors = () => !_success

	apiRes.sendIfErrors = () => {
		if (apiRes.hasErrors()) {
			apiRes.json()
			return true
		}
	}

	apiRes.set = (_apiRes) => {
		let { data, success, message, validation, redirect } = _apiRes.get()
		if (redirect) {
			_redirect = redirect
		} else {
			_data = data
			_success = success
			_message = message
			_validation = validation
		}
		return apiRes
	}

	apiRes.merge = (_apiRes) => {
		let { data, success, message, validation, redirect } = _apiRes.get()
		if (redirect) {
			_redirect = redirect
		} else {
			Object.assign(_data, data)
			if (validation) {
				_validation = { ...(_validation || {}), ...validation }
			}
			if (!success) _success = false
			if (message) _message = message
		}
		return apiRes
	}
	return apiRes
}

ApiRes.mid = () => (req, res, next) => {
	res.api = ApiRes().setContext(req, res)
	next()
}

module.exports = ApiRes
