const { ConfigService } = require('#/admin')
const { v } = require('#/utils')

//UA-16376474-14

ConfigService.define('Analytics', {
	name: 'Analytics',
	fields: {
		gaEnabled: {
			type: 'boolean',
			label: 'Habilitar Google Analytics',
		},
		gaId: {
			type: 'string',
			label: 'Google Analytics - ID de seguimiento',
			componentAttrs: { placeholder: 'UA-XXXXXXXX-XX' },
		},
	},
	reference: async (instance) => {
		let { gaEnabled, gaId } = instance.data
		let str = []
		str.push(`Google Analytics (${gaEnabled ? gaId : 'deshabilitado'})`)
		return [{ type: 'text', value: str.join('<br>') }]
	},
	dataRules: (instance) => ({
		gaId: [
			v.requiredIf(instance.data.gaEnabled),
			v.re(/^UA-[0-9]+-[0-9]+$/, 'El formato debe ser UA-XXXXXXXX-XX'),
		],
	}),
})
