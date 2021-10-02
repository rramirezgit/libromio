const XRouter = require('./x-router')

function _Flash() {
	let that = this
	that.msg = null
	that.data = {}
	that.validations = {}
	that.success = false
	that.hasValidations = () => !!Object.keys(that.validations).length
	that.hasValidation = (key) => !!that.validations[key]
	that.getValidationsArray = () => {
		return Object.entries(that.validations).map(([key, msg]) => {
			return { key, msg }
		})
	}
	that.toJson = () => {
		return {
			data: that.data,
			validations: that.hasValidations() ? that.validations : null,
			message: that.msg,
		}
	}
}

function _FlashSetter(flashInstance, req, res) {
	let that = this
	let setFlashProp = (k, v) => {
		flashInstance[k] = v
		req.session.flash = flashInstance
	}

	that.msg = (type, msg = {}) => {
		setFlashProp('msg', createMsg(type, msg))
		return that
	}
	that.success = (text = null, description = null) => {
		setFlashProp('msg', createMsg('success', { text, description }))
		return that
	}
	that.warning = (text = null, description = null) => {
		setFlashProp('msg', createMsg('warning', { text, description }))
		return that
	}
	that.error = (text = null, description = null) => {
		setFlashProp('msg', createMsg('error', { text, description }))
		return that
	}
	that.info = (text = null, description = null) => {
		setFlashProp('msg', createMsg('info', { text, description }))
		return that
	}
	that.data = (k, v) => {
		let data = flashInstance.data
		if (typeof k === 'object') {
			for (var x in k) data[x] = k[x]
		} else {
			data[k] = v
		}
		setFlashProp('data', data)
		return that
	}
	that.validations = (errors) => {
		setFlashProp('validations', { ...flashInstance.validations, ...errors })
		return that
	}
	;(that.redirect = (to) => {
		to = to || '/'
		req.xhr ? res.json({ redirect: to }) : res.redirect(to)
	}),
		(that.xRedirect = (routeName, params) => {
			that.redirect(XRouter.url(routeName, params))
		}),
		(that.redirectToReferer = (opt = {}) =>
			that.redirect(req.get('Referer') || opt.fallback))
	that.json = () => {
		req.session.flash = null
		res.json(flashInstance.toJson())
	}
}

/*
type = "info|error|success|warning"
msg = {
	title: "",
	text: "",
	description: "",
}
*/
function createMsg(type, msg = {}) {
	return {
		type,
		title: msg.title,
		text: msg.text,
		description: msg.description,
	}
}

class FlashError extends Error {
	constructor(message) {
		if (typeof message === 'object') {
			super(message.text)
			this._flashMsg = createMsg(message.type || 'error', message)
		} else {
			super(message)
			this._flashMsg = createMsg('error', { text: message })
		}
		this.name = this.constructor.name
		Error.captureStackTrace(this, this.constructor)
	}

	get isFlash() {
		return true
	}

	type(type) {
		this._flashMsg.type = type
		return this
	}

	redirectTo(to) {
		this._redirectTo = to
		return this
	}

	xRedirectTo(to, params) {
		this._xRedirectTo = to
		this._xRedirectToParams = params
		return this
	}

	redirectToReferer() {
		this._redirectToReferer = true
		return this
	}

	static fromError(err) {
		return new FlashError(err.message)
	}
}

module.exports = {
	FlashError,
	flash: () => (req, res, next) => {
		let flash = req.session.flash || new _Flash()
		req.session.flash = null

		res.flash = new _FlashSetter(flash, req, res)

		let getFlash = () => {
			req.session.flash = null
			return flash
		}
		res.locals.flash = getFlash
		req.flash = getFlash
		next()
	},
	flashErrorHandler: () => (err, req, res, next) => {
		if (!err.isFlash) {
			return next(err)
		}
		res.flash.msg(err._flashMsg.type, err._flashMsg)
		if (err._xRedirectTo) {
			res.flash.xRedirect(err._xRedirectTo, err._xRedirectToParams)
		} else if (err._redirectTo) {
			res.flash.redirect(err._redirectTo)
		} else if (req.xhr) {
			res.flash.json()
		} else {
			res.flash.redirectToReferer()
		}
	},
}
