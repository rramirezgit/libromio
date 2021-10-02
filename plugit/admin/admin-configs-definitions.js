const fs = require('fs')
const ConfigService = require('./services/config-service')
const { v, filenamer, Imager } = require('#/utils')

ConfigService.defineCustomFieldType('Image', {
	componentName: 'ImageInput',
	label: 'Imagen',
	componentAttrs: {
		editable: true,
		initialSrc: (instance, field) => instance.data[field.key],
	},
})

ConfigService.defineCustomFieldType('Url', {
	type: 'string',
	componentAttrs: {
		hint: 'URL completa (https://...) o relativa (/shop/..)',
	},
})

ConfigService.define('AdminTheme', {
	name: 'Tema del Panel Administrador',
	program: true,
	fields: {
		name: {
			type: 'string',
			label: 'Título',
			defaultValue: 'Panel Administrador',
		},
		logo: {
			customType: 'Image',
			fileKey: 'logoFile',
			label: 'Logo',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
		},
		favicon: {
			customType: 'Image',
			fileKey: 'faviconFile',
			label: 'Favicon',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: `PNG | 32 x 32px`,
			},
		},
	},
	reference: (instance) => [
		{ type: 'image', value: instance.data.logo },
		{ type: 'text', value: instance.data.name },
	],
	dataRules: () => ({
		name: [v.required()],
	}),
	filesRules: (instance, isNew) => ({
		logoFile: [v.requiredIf(isNew), v.file.isImage()],
		faviconFile: [v.requiredIf(isNew), v.file.validTypes('png'), v.file.dimension({ w: 32, h: 32 })],
	}),
	filesUpload: (instance) => ({
		logoFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `admin_theme_logo_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.png(upload.path, { height: 70 })
				instance.setData('logo', url)
			},
		},
		faviconFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `favicon-admin-32x32-${Date.now()}`,
				})
			},
			dest: `public/uploads`,
			done: async ({ upload }) => {
				let { url } = await Imager.png(upload.path, { webp: false })
				instance.setData('favicon', url)
			},
		},
	}),
})
