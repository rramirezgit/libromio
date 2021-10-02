const { createTransport } = require('nodemailer')
const _all = {}
const Transport = {}

/**
 * @typedef {{
 * 	host: string,
 * 	port: string,
 * 	secure: boolean,
 * 	auth?: {
 * 		user: string,
 * 		pass: string,
 * 	},
 * 	dkim?: {
 * 		domainName: string,
 * 		keySelector: string,
 * 		privateKey: string,
 * 	},
 * 	from?: {
 * 		name: string,
 * 		address: string,
 * 	}
 * }} TransportOptions
 */

/**
 * @param {string} key
 * @param {{
 * 	options: TransportOptions,
 * 	optionsGetter: () => TransportOptions,
 * }} data
 */
Transport.define = (key, data) => {
	_all[key] = {
		options: data.options,
		optionsGetter: data.optionsGetter,
		transporter: null,
	}
}

/**
 * @param {string} key
 * @param {TransportOptions} options
 */
Transport.setup = async (key, options = null) => {
	if (!options) {
		let data = _all[key]
		if (data?.transporter) {
			return true
		} else if (data?.options) {
			options = data.options
		} else if (data?.optionsGetter) {
			options = await data.optionsGetter()
		}
	}

	if (!options) return `No hay opciones definidas para inicializar el Email Transport '${key}'`

	let { from, ...transportOptions } = options
	let defaultEmailOptions = from ? { from } : undefined
	let transporter = null
	try {
		transporter = createTransport(transportOptions, defaultEmailOptions)
	} catch (error) {
		return 'Ha ocurrido un error en la configuración SMTP' + (error.message ? ` (${error.message})` : '')
	}

	let result = await new Promise((resolve) => {
		transporter.verify(function(error, success) {
			if (error) resolve(error)
			else resolve(true)
		})
	})

	if (result === true) {
		_all[key] = _all[key] || {}
		Object.assign(_all[key], { options, transporter })
		return true
	} else {
		return `Resultado de verificación SMTP: ${result}`
	}
}

Transport.get = async (key) => {
	let result = await Transport.setup(key)
	if (result !== true) return null
	return _all[key].transporter
}

module.exports = Transport
