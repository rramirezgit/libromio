const { ConfigService } = require('#/admin')
const { v, filenamer, Imager } = require('#/utils')

ConfigService.define('SiteFavicon', {
	name: 'Sitio/Favicon',
	fields: {
		faviconSm: {
			customType: 'Image',
			fileKey: 'faviconSmFile',
			label: 'Favicon 16x16',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: `PNG | 16 x 16px`,
			},
		},
		faviconMd: {
			customType: 'Image',
			fileKey: 'faviconMdFile',
			label: 'Favicon 32x32',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: `PNG | 32 x 32px`,
			},
		},
		faviconLg: {
			customType: 'Image',
			fileKey: 'faviconLgFile',
			label: 'Favicon 96x96',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: `PNG | 96 x 96px`,
			},
		},
	},
	reference: (instance) => [{ type: 'image', value: instance.data.faviconLg }],
	filesRules: (instance, isNew) => ({
		faviconSmFile: [v.requiredIf(isNew), v.file.validTypes('png'), v.file.dimension({ w: 16, h: 16 })],
		faviconMdFile: [v.requiredIf(isNew), v.file.validTypes('png'), v.file.dimension({ w: 32, h: 32 })],
		faviconLgFile: [v.requiredIf(isNew), v.file.validTypes('png'), v.file.dimension({ w: 96, h: 96 })],
	}),
	filesUpload: (instance) => ({
		faviconSmFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `favicon-16x16_${Date.now()}`,
				})
			},
			dest: `public/uploads`,
			done: async ({ upload }) => {
				let { url } = await Imager.png(upload.path, { webp: false })
				instance.setData('faviconSm', url)
			},
		},
		faviconMdFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `favicon-32x32_${Date.now()}`,
				})
			},
			dest: `public/uploads`,
			done: async ({ upload }) => {
				let { url } = await Imager.png(upload.path, { webp: false })
				instance.setData('faviconMd', url)
			},
		},
		faviconLgFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `favicon-96x96_${Date.now()}`,
				})
			},
			dest: `public/uploads`,
			done: async ({ upload }) => {
				let { url } = await Imager.png(upload.path, { webp: false })
				instance.setData('faviconLg', url)
			},
		},
	}),
})

ConfigService.define('SiteScripts', {
	name: 'Sitio/Scripts',
	multiple: true,
	fields: {
		name: {
			type: 'string',
			label: 'Nombre de referencia del script',
		},
		zone: {
			type: 'select',
			label: 'Ubicación del script',
			componentAttrs: {
				items: [
					{ text: 'head', value: 'head' },
					{ text: 'Al comienzo del body', value: 'body-start' },
					{ text: 'Al cierre del body', value: 'body-end' },
				],
			},
		},
		script: {
			type: 'text',
			label: 'Script',
		},
	},
	reference: ({ data }) => [{ type: 'text', value: `${data.name} (${data.zone})` }],
	referenceKey: ({ data }) => `${data.zone}-${data.name}`,
})
