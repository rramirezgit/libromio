const { ConfigService } = require('#/admin')
const { v } = require('#/utils')

ConfigService.define('OrderCode', {
	name: 'Shop/Código de Orden',
	fields: {
		prefix: {
			type: 'string',
			label: 'Prefijo',
			columns: 3,
			componentAttrs: {
				hint: 'Opcional',
				persistentHint: true,
			},
		},
		minLength: {
			type: 'number',
			label: 'Cantidad mínina de números',
			columns: 6,
			componentAttrs: {
				hint: 'Si el número de orden tiene una cantidad menor de números se rellenará con ceros a la izquierda',
				persistentHint: true,
			},
		},
		suffix: {
			type: 'string',
			label: 'Sufijo',
			columns: 3,
			componentAttrs: {
				hint: 'Opcional',
				persistentHint: true,
			},
		},
		initialValue: { type: 'number', label: 'Número de orden inicial' },
	},
	reference: async (instance) => {
		let { prefix, minLength, suffix, initialValue } = instance.data
		let num = String(initialValue).padStart(minLength, '0')
		let value = `${prefix || ''}${num}${suffix || ''}`
		return [{ type: 'text', value }]
	},
	dataRules: (instance) => ({
		prefix: [
			v.ifNotEmpty(),
			v.re(/^[a-z0-9-_]+$/i, 'Solo se permiten letras (sin tildes), números o guiones.'),
		],
		suffix: [
			v.ifNotEmpty(),
			v.re(/^[a-z0-9-_]+$/i, 'Solo se permiten letras (sin tildes), números o guiones.'),
		],
		minLength: [v.required(), v.between(1, 12)],
		initialValue: [v.int()],
	}),
})
