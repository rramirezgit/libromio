const ConfigService = require('./services/config-service')
const { v } = require('#/utils')
const { Transport } = require('#/mailer')

let _getTransportOptionsFromConfigData = (data) => {
	let transportOptions = {
		host: data.host,
		port: data.port,
		secure: data.secure == 1,
		auth: {
			user: data.username,
			pass: data.password,
		},
		from: {
			name: data.fromName,
			address: data.fromAddress,
		},
	}
	if (data.dkimDomain && data.dkimKeySelector && data.dkimPrivateKey) {
		transportOptions.dkim = {
			domainName: data.dkimDomain,
			keySelector: data.dkimKeySelector,
			privateKey: data.dkimPrivateKey,
		}
	}

	return transportOptions
}

module.exports = (transportKey, name) => {
	let configKey = `MailerSMTP__${transportKey}`
	ConfigService.define(configKey, {
		name: `Mailer/SMTP/${name}`,
		fields: {
			host: {
				type: 'string',
				label: 'SMTP Host',
			},
			port: {
				type: 'string',
				label: 'SMTP Puerto',
			},
			secure: {
				type: 'select',
				label: 'TLS',
				defaultValue: 0,
				componentAttrs: {
					items: [
						{ text: 'No', value: 0 },
						{ text: 'Si', value: 1 },
					],
				},
			},
			username: {
				type: 'string',
				label: 'SMTP Usuario',
			},
			password: {
				type: 'string',
				label: 'SMTP Contraseña',
			},
			fromName: {
				type: 'string',
				label: 'Nombre del enviador',
			},
			fromAddress: {
				type: 'string',
				label: 'Email del enviador',
			},
			dkimDomain: {
				type: 'string',
				label: 'DKIM Domain',
				componentAttrs: { hint: 'No obligatorio' },
			},
			dkimKeySelector: {
				type: 'string',
				label: 'DKIM Key Selector',
				componentAttrs: { hint: 'No obligatorio' },
			},
			dkimPrivateKey: {
				type: 'string',
				label: 'DKIM Private Key',
				componentAttrs: { hint: 'No obligatorio' },
			},
		},
		reference: async (instance) => {
			let { host, port, username } = instance.data
			return [{ type: 'text', value: `${username} | ${host}:${port}` }]
		},
		dataRules: (instance) => ({
			host: [v.required()],
			port: [v.required()],
			secure: [v.required(), v.in([1, 0])],
			username: [v.required()],
			password: [v.required()],
			fromName: [v.required()],
			fromAddress: [v.required(), v.email()],
		}),
		beforeSave: async (instance, isNew, apiRes) => {
			let transportOptions = _getTransportOptionsFromConfigData(instance.data)
			let result = await Transport.setup(transportKey, transportOptions)
			if (result !== true) apiRes.error(result)
		},
	})

	Transport.define(transportKey, {
		optionsGetter: async () => {
			let data = await ConfigService.getActiveData(configKey)
			if (!data) return null
			return _getTransportOptionsFromConfigData(data)
		},
	})
}
