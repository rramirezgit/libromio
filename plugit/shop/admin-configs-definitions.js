const { ConfigService } = require('#/admin')
const { v, filenamer, Imager } = require('#/utils')

ConfigService.define('BusinessInfo', {
	name: 'Información del comercio',
	fields: {
		name: { type: 'string', label: 'Nombre' },
		taxNumber: { type: 'string', label: 'CUIT' },
		address: { type: 'string', label: 'Dirección / Domicilio' },
		email: { type: 'string', label: 'Email de contacto' },
		phone: { type: 'string', label: 'Teléfono' },
		whatsapp: { type: 'string', label: 'WhatsApp' },
		facebook: { type: 'string', label: 'URL Facebook' },
		instagram: { type: 'string', label: 'URL Instagram' },
		afipLink: { type: 'string', label: 'URL AFIP' },
	},
	reference: async (instance) => [{ type: 'text', value: instance.data.name }],
	dataRules: (instance) => ({
		name: [v.required()],
		email: [v.required(), v.email()],
		phone: [v.required()],
	}),
})

ConfigService.define('SiteLogo', {
	name: 'Sitio/Logo',
	program: true,
	fields: {
		logo: {
			customType: 'Image',
			fileKey: 'logoFile',
			label: 'Logo',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
		},
		logoWhite: {
			customType: 'Image',
			fileKey: 'logoWhiteFile',
			label: 'Logo Blanco',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
		},
	},
	reference: (instance) => [{ type: 'image', wider: true, value: instance.data.logo }],
	filesRules: (instance, isNew) => ({
		logoFile: [v.requiredIf(isNew), v.file.isImage()],
		logoWhiteFile: [v.requiredIf(isNew), v.file.isImage()],
	}),
	filesUpload: (instance) => ({
		logoFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `site_logo_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.png(upload.path, { height: 60 })
				instance.setData('logo', url)
			},
		},
		logoWhiteFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `site_logo_white_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.png(upload.path, { height: 60 })
				instance.setData('logoWhite', url)
			},
		},
	}),
})
