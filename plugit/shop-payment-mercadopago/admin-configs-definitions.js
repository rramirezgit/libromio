const { ConfigService } = require('#/admin')
const { v } = require('#/utils')

ConfigService.define('MercadoPago', {
	name: 'Shop/Mercadopago Checkout API',
	fields: {
		sandbox: {
			type: 'boolean',
			label: 'Modo sandbox',
			defaultValue: false,
		},
		publicKey: {
			type: 'string',
			label: 'Llave Pública',
		},
		accessToken: {
			type: 'string',
			label: 'Token de Acceso',
		},
	},
	dataRules: () => ({
		publicKey: [v.required()],
		accessToken: [v.required()],
	}),
	reference: (instance) => [{ type: 'text', value: instance.data.publicKey }],
})
