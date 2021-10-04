const { ConfigService } = require('#/admin')
const { v } = require('#/utils')

ConfigService.define('Andreani', {
	name: 'Andreani Shipping',
	fields: {
		contrato: {
			type: 'string',
			label: 'Código de contrato con Andreani.',
		},
	},
	dataRules: () => ({
		contrato: [v.required()],
	}),
	reference: (instance) => [{ type: 'text', value: instance.data.publicKey }],
})
