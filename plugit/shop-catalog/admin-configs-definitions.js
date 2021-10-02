const CollectionService = require('./services/collection-service')
const { ConfigService } = require('#/admin')
const { v, filenamer, Imager } = require('#/utils')

ConfigService.defineCustomFieldType(
	'Collection',
	{
		componentName: 'CollectionSelector',
		label: 'Colección de productos',
		componentAttrs: {
			canCreate: true,
		},
	},
	(field) => ({
		events: {
			'Collection.DELETE': async (instance, { id: collectionId }) => {
				if (instance.data[field.key] == collectionId) {
					await instance.destroy()
				}
			},
		},
	})
)

ConfigService.define('ShopCollections', {
	name: 'Shop/Colecciones',
	multiple: true,
	program: true,
	fields: {
		title: {
			type: 'string',
			label: 'Título',
		},
		urlKeywords: {
			type: 'multiString',
			label: 'Keywords de URL',
			componentAttrs: {
				hint:
					'Establece las urls para que la colección pueda ser linkeada en el shop. Ej: "hotsale" (la url "/hotsale" quedará habilitada y mostrará el shop con la colección seleccionada).',
				persistentHint: true,
			},
		},
		searchKeywords: {
			type: 'multiString',
			label: 'Keywords de búsqueda',
			componentAttrs: {
				hint:
					'Establece las palabras adicionales para que los productos de la colección puedan ser encontrados con el buscador',
				persistentHint: true,
			},
		},
		collectionId: {
			customType: 'Collection',
		},
		showShopFilter: {
			type: 'boolean',
			label: 'Mostrar filtro en el shop',
		},
		shopFilterColor: {
			type: 'color',
			label: 'Color del filtro',
			columns: 6,
		},
		shopFilterPosition: {
			type: 'number',
			label: 'Posición del filtro',
			columns: 6,
		},
		showShopImage: {
			type: 'boolean',
			label: 'Mostrar imagen superior del shop',
		},
		shopImage: {
			customType: 'Image',
			fileKey: 'imgFile',
			label: 'Imagen superior del shop',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: `1920 x 300px`,
				wider: true,
			},
		},
		shopImageMobile: {
			customType: 'Image',
			fileKey: 'imgMobileFile',
			label: 'Imagen superior del shop Mobile',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: `800 x 300px`,
				wider: true,
			},
		},
	},
	reference: async (instance) => {
		let { title, collectionId } = instance.data
		let { keyname } = await CollectionService.get(collectionId)
		return [{ type: 'text', value: `${title} (${keyname})` }]
	},
	dataRules: (instance) => ({
		title: v.required(),
		urlKeywords: [v.required(), v.each(v.urlSlug())],
		collectionId: v.required(),
		shopFilterColor: [v.ifNotEmpty(), v.hexColor()],
		shopFilterPosition: [v.ifNotEmpty(), v.int(), v.gte(1)],
	}),
	filesRules: (instance, isNew) => ({
		imgFile: [
			v.requiredIf(instance.data.showShopImage && !instance.data.shopImage),
			v.file.isImage(),
			v.file.dimension({ w: 1920, h: 300 }),
		],
		imgMobileFile: [
			v.requiredIf(instance.data.showShopImage && !instance.data.shopImageMobile),
			v.file.isImage(),
			v.file.dimension({ w: 800, h: 300 }),
		],
	}),
	filesUpload: (instance) => ({
		imgFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `shop_collection_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('shopImage', url)
			},
		},
		imgMobileFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `shop_collection_mobile_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('shopImageMobile', url)
			},
		},
	}),
})
