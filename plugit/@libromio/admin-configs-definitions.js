const { ConfigService } = require('#/admin')
const { ProductService, CollectionService } = require('#/shop-catalog')
const { v, filenamer, Imager } = require('#/utils')

ConfigService.define('HomeSliders', {
	name: 'Home/Slider Principal',
	multiple: true,
	program: true,
	fields: {
		position: {
			type: 'number',
			label: 'Posición en carousel',
			defaultValue: 1,
			columns: 4,
		},
		link: {
			customType: 'Url',
			label: 'Link URL',
		},
		img: {
			customType: 'Image',
			fileKey: 'imgFile',
			label: 'Slider',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '1181 x 522px',
				wider: true,
			},
		},
		imgMobile: {
			customType: 'Image',
			fileKey: 'imgMobileFile',
			label: 'Slider Mobile',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '600 x 917px',
				wider: false,
			},
		},
	},
	activeDataGetter: (data) => {
		return data.sort((a, b) => a.position - b.position)
	},
	reference: (instance) => [
		{ type: 'text', value: `#${instance.data.position || 1}` },
		{ type: 'image', wider: true, value: instance.data.img },
		//{ type: 'image', wider: true, value: instance.data.imgMobile },
	],
	referenceKey: (instance) => instance.data.position,
	dataRules: (instance) => ({
		position: [v.required(), v.int(), v.gte(1)],
		//link: [v.required()],
	}),
	filesRules: (instance, isNew) => ({
		imgFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 1181, h: 522 })],
		imgMobileFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 600, h: 917 })],
	}),
	filesUpload: (instance) => ({
		imgFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_slider_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('img', url)
			},
		},
		imgMobileFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_slider_mobile_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgMobile', url)
			},
		},
	}),
})

ConfigService.define('HomeFeatured1', {
	name: 'Home/Tarjetas de producto',
	program: true,
	fields: {
		title: {
			type: 'string',
			label: 'Título',
			defaultValue: '',
		},
		collectionId: {
			customType: 'Collection',
		},
		limit: {
			type: 'number',
			label: 'Cantidad de productos',
			defaultValue: 8,
			columns: 6,
		},
		ctaTxt: {
			type: 'string',
			label: 'Texto del CTA',
			defaultValue: 'ver más productos',
		},
		link: {
			customType: 'Url',
			label: 'Link URL',
			defaultValue: '',
		},
		/*randomize: {
			type: 'boolean',
			label: 'Ordernar aleatoriamente en cada impresión',
			defaultValue: true,
		},*/
	},
	activeDataGetter: async (data) => {
		let { products } = await ProductService.getAll({
			collectionId: data.collectionId,
			limit: data.limit,
			randomize: true,
			nonBuyableLast: true,
			shopable: true,
			scope: 'card',
		})
		return {
			title: data.title,
			products,
			ctaTxt: data.ctaTxt,
			link: data.link,
		}
	},
	reference: async (instance) => {
		let collection = await CollectionService.get(instance.data.collectionId)
		return [
			{
				type: 'text',
				value: `${instance.data.title} / ${collection.keyname}`,
			},
		]
	},
	dataRules: (instance) => ({
		limit: [v.required()],
		collectionId: [v.required()],
		ctaTxt: [],
		link: [],
	}),
})

ConfigService.define('HomeBoxesThree', {
	name: 'Home/Cajas A',
	multiple: false,
	program: true,
	fields: {
		titleText: {
			type: 'string',
			label: 'Titulo de la sección',
			defaultValue: '',
		},
		imgFirst: {
			customType: 'Image',
			fileKey: 'imgFirstFile',
			label: 'Imagen de la Primera Tarjeta',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '384 x 384px',
				wider: true,
			},
		},
		ctaColorFirstBox: {
			type: 'color',
			label: 'Color del botón de la primera caja',
		},
		ctaTextFirstBox: {
			type: 'string',
			label: 'Texto del botón de la primera caja',
			defaultValue: 'Ingresar',
		},
		LinkFirstBox: {
			customType: 'Url',
			label: 'Link URL del botón de la primera caja',
		},
		imgSecond: {
			customType: 'Image',
			fileKey: 'imgSecondFile',
			label: 'Imagen de la Segunda Tarjeta',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '384 x 384px',
				wider: true,
			},
		},
		ctaColorSecondBox: {
			type: 'color',
			label: 'Color del botón de la segunda caja',
		},
		ctaTextSecondBox: {
			type: 'string',
			label: 'Texto del botón de la segunda caja',
			defaultValue: 'Ingresar',
		},
		LinkSecondBox: {
			customType: 'Url',
			label: 'Link URL del botón de la segunda caja',
		},
		imgThird: {
			customType: 'Image',
			fileKey: 'imgThirdFile',
			label: 'Imagen de la tercera Tarjeta',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '384 x 384px',
				wider: true,
			},
		},
		ctaColorThirdBox: {
			type: 'color',
			label: 'Color del botón de la tercera caja',
		},
		ctaTextThirdBox: {
			type: 'string',
			label: 'Texto del botón de la tercera caja',
			defaultValue: 'Ingresar',
		},
		LinkThirdBox: {
			customType: 'Url',
			label: 'Link URL del botón de la tercera caja',
		},
	},
	reference: (instance) => {
		let { imgFirst } = instance.data
		return [
			{ type: 'image', value: imgFirst },
			{ type: 'text', value: instance.data.titleText },
		]
	},
	referenceKey: (instance) => instance.data.ctaTextFirstBox,
	dataRules: (instance) => ({
		titleText: [],
		ctaColorFirstBox: [v.hexColor()],
		ctaTextFirstBox: [],
		LinkFirstBox: [],
		ctaColorSecondBox: [v.hexColor()],
		ctaTextSecondBox: [],
		LinkSecondBox: [],
		ctaColorThirdBox: [v.hexColor()],
		ctaTextThirdBox: [],
		LinkThirdBox: [],
	}),
	filesRules: (instance, isNew) => ({
		imgFirstFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 384, h: 384 })],
		imgSecondFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 384, h: 384 })],
		imgThirdFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 384, h: 384 })],
	}),
	filesUpload: (instance) => ({
		imgFirstFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_three_box_img_1_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgFirst', url)
			},
		},
		imgSecondFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_three_box_img_2_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgSecond', url)
			},
		},
		imgThirdFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_three_box_img_3_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgThird', url)
			},
		},
	}),
})

ConfigService.define('CarouselB', {
	name: 'Home/Carousel B',
	multiple: true,
	program: true,
	fields: {
		position: {
			type: 'number',
			label: 'Posición en carousel',
			defaultValue: 1,
			columns: 4,
		},
		img: {
			customType: 'Image',
			fileKey: 'img',
			label: 'Imagen para mostrar',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '1184 x 286px',
				wider: true,
			},
		},
		link: {
			customType: 'Url',
			label: 'Link URL',
		},
	},
	activeDataGetter: (data) => {
		return data.sort((a, b) => a.position - b.position)
	},
	reference: (instance) => {
		let { img, position } = instance.data
		return [
			{ type: 'text', value: `#${position || 1}` },
			{ type: 'image', value: img },
		]
	},
	referenceKey: (instance) => instance.data.position,
	filesRules: (instance, isNew) => ({
		img: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 1184, h: 286 })],
	}),
	dataRules: (instance) => ({
		position: [v.required(), v.int(), v.gte(1)],
		link: [],
	}),
	filesUpload: (instance) => ({
		img: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_user_review_img_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('img', url)
			},
		},
	}),
})

ConfigService.define('HomeFeatured2', {
	name: 'Home/Carousel de tarjetas de producto',
	program: true,
	fields: {
		collectionId: {
			customType: 'Collection',
		},
		limit: {
			type: 'number',
			label: 'Cantidad de productos',
			defaultValue: 8,
			columns: 6,
		},
		/*randomize: {
			type: 'boolean',
			label: 'Ordernar aleatoriamente en cada impresión',
			defaultValue: true,
		},*/
	},
	activeDataGetter: async (data) => {
		let { products } = await ProductService.getAll({
			collectionId: data.collectionId,
			limit: data.limit,
			randomize: true,
			nonBuyableLast: true,
			shopable: true,
			scope: 'card',
		})
		return {
			title: data.title,
			products,
			ctaTxt: data.ctaTxt,
			link: data.link,
		}
	},
	reference: async (instance) => {
		let collection = await CollectionService.get(instance.data.collectionId)
		return [
			{
				type: 'text',
				value: `${instance.data.title} / ${collection.keyname}`,
			},
		]
	},
	dataRules: (instance) => ({
		limit: [v.required()],
		collectionId: [v.required()],
	}),
})

ConfigService.define('HomeBoxesFourth', {
	name: 'Home/Cajas B',
	multiple: false,
	program: true,
	fields: {
		titleText: {
			type: 'string',
			label: 'Titulo de la sección',
			defaultValue: '',
		},
		imgFirst: {
			customType: 'Image',
			fileKey: 'imgFirstFile',
			label: 'Imagen de la Primera Tarjeta',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '284 x 354px',
				wider: false,
			},
		},
		ctaTextFirstBox: {
			type: 'string',
			label: 'Texto del botón de la primera caja',
			defaultValue: '',
		},
		LinkFirstBox: {
			customType: 'Url',
			label: 'Link URL del botón de la primera caja',
		},
		imgSecond: {
			customType: 'Image',
			fileKey: 'imgSecondFile',
			label: 'Imagen de la Segunda Tarjeta',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '284 x 354px',
				wider: false,
			},
		},
		ctaTextSecondBox: {
			type: 'string',
			label: 'Texto del botón de la segunda caja',
			defaultValue: '',
		},
		LinkSecondBox: {
			customType: 'Url',
			label: 'Link URL del botón de la segunda caja',
		},
		imgThird: {
			customType: 'Image',
			fileKey: 'imgThirdFile',
			label: 'Imagen de la tercera Tarjeta',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '284 x 354px',
				wider: false,
			},
		},
		ctaTextThirdBox: {
			type: 'string',
			label: 'Texto del botón de la tercera caja',
			defaultValue: '',
		},
		LinkThirdBox: {
			customType: 'Url',
			label: 'Link URL del botón de la tercera caja',
		},
		imgFourth: {
			customType: 'Image',
			fileKey: 'imgFourthFile',
			label: 'Imagen de la cuarta Tarjeta',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '284 x 354px',
				wider: false,
			},
		},
		ctaTextFourthBox: {
			type: 'string',
			label: 'Texto del botón de la cuarta caja',
			defaultValue: '',
		},
		LinkFourthBox: {
			customType: 'Url',
			label: 'Link URL del botón de la cuarta caja',
		},
	},
	reference: (instance) => {
		let { imgFirst } = instance.data
		return [
			{ type: 'image', value: imgFirst },
			{ type: 'text', value: instance.data.titleText },
		]
	},
	referenceKey: (instance) => instance.data.ctaTextFirstBox,
	dataRules: (instance) => ({
		titleText: [],
		ctaTextFirstBox: [],
		LinkFirstBox: [],
		ctaTextSecondBox: [],
		LinkSecondBox: [],
		ctaTextThirdBox: [],
		LinkThirdBox: [],
		ctaTextFourthBox: [],
		LinkFourthBox: [],
	}),
	filesRules: (instance, isNew) => ({
		imgFirstFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 284, h: 354 })],
		imgSecondFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 284, h: 354 })],
		imgThirdFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 284, h: 354 })],
		imgFourthFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 284, h: 354 })],
	}),
	filesUpload: (instance) => ({
		imgFirstFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_fourth_box_img_1_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgFirst', url)
			},
		},
		imgSecondFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_fourth_box_img_2_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgSecond', url)
			},
		},
		imgThirdFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_fourth_box_img_3_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgThird', url)
			},
		},
		imgFourthFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_fourth_box_img_4_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgFourth', url)
			},
		},
	}),
})

ConfigService.define('CarouselC', {
	name: 'Home/Carousel C',
	multiple: true,
	program: true,
	fields: {
		position: {
			type: 'number',
			label: 'Posición en carousel',
			defaultValue: 1,
			columns: 4,
		},
		img: {
			customType: 'Image',
			fileKey: 'img',
			label: 'Imagen para mostrar',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '284 x 289px',
				wider: true,
			},
		},
		link: {
			customType: 'Url',
			label: 'Link URL',
		},
	},
	activeDataGetter: (data) => {
		return data.sort((a, b) => a.position - b.position)
	},
	reference: (instance) => {
		let { img, position } = instance.data
		return [
			{ type: 'text', value: `#${position || 1}` },
			{ type: 'image', value: img },
		]
	},
	referenceKey: (instance) => instance.data.position,
	filesRules: (instance, isNew) => ({
		img: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 284, h: 289 })],
	}),
	dataRules: (instance) => ({
		position: [v.required(), v.int(), v.gte(1)],
		link: [],
	}),
	filesUpload: (instance) => ({
		img: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_carousel_c_img_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('img', url)
			},
		},
	}),
})

ConfigService.define('HomeFiveBoxes', {
	name: 'Home/Cajas C',
	multiple: false,
	program: true,
	fields: {
		img: {
			customType: 'Image',
			fileKey: 'imgFile',
			label: 'Imagen de la Tarjeta Grande',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '540 x 540px',
				wider: true,
			},
		},
		imgFirst: {
			customType: 'Image',
			fileKey: 'imgFirstFile',
			label: 'Imagen de la Primera Tarjeta pequeña',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '301 x 260px',
				wider: true,
			},
		},
		LinkFirstBox: {
			customType: 'Url',
			label: 'Link URL del botón de la primera caja',
		},
		imgSecond: {
			customType: 'Image',
			fileKey: 'imgSecondFile',
			label: 'Imagen de la Segunda Tarjeta pequeña',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '301 x 260px',
				wider: true,
			},
		},
		LinkSecondBox: {
			customType: 'Url',
			label: 'Link URL del botón de la segunda caja',
		},
		imgThird: {
			customType: 'Image',
			fileKey: 'imgThirdFile',
			label: 'Imagen de la tercera Tarjeta pequeña',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '301 x 260px',
				wider: true,
			},
		},
		LinkThirdBox: {
			customType: 'Url',
			label: 'Link URL del botón de la tercera caja',
		},
		imgFourth: {
			customType: 'Image',
			fileKey: 'imgFourthFile',
			label: 'Imagen de la cuarta Tarjeta pequeña',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '301 x 260px',
				wider: true,
			},
		},
		LinkFourthBox: {
			customType: 'Url',
			label: 'Link URL del botón de la cuarta caja',
		},
	},
	reference: (instance) => {
		let { imgFirst } = instance.data
		return [{ type: 'image', value: imgFirst }]
	},
	referenceKey: (instance) => instance.data.imgFirst,
	dataRules: (instance) => ({
		LinkFirstBox: [],
		LinkSecondBox: [],
		LinkThirdBox: [],
		LinkFourthBox: [],
	}),
	filesRules: (instance, isNew) => ({
		imgFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 540, h: 540 })],
		imgFirstFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 301, h: 260 })],
		imgSecondFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 301, h: 260 })],
		imgThirdFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 301, h: 260 })],
		imgFourthFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 301, h: 260 })],
	}),
	filesUpload: (instance) => ({
		imgFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_box_c_large_img_1_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('img', url)
			},
		},
		imgFirstFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_box_c_small_img_1_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgFirst', url)
			},
		},
		imgSecondFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_box_c_small_img_2_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgSecond', url)
			},
		},
		imgThirdFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_box_c_small_img_3_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgThird', url)
			},
		},
		imgFourthFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_box_c_small_img_4_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgFourth', url)
			},
		},
	}),
})

ConfigService.define('ExpansionTabs', {
	name: 'Home/Cajas Expandibles',
	multiple: true,
	program: true,
	fields: {
		position: {
			type: 'number',
			label: 'Posición en el listado',
			defaultValue: 1,
			columns: 4,
		},
		title: {
			type: 'string',
			label: 'Titulo de la caja',
			defaultValue: '',
		},
		content: {
			type: 'string',
			label: 'Contenido de la caja',
			defaultValue: '',
		},
	},
	activeDataGetter: (data) => {
		return data.sort((a, b) => a.position - b.position)
	},
	reference: (instance) => {
		let { title, position } = instance.data
		return [
			{ type: 'text', value: `#${position || 1}` },
			{ type: 'image', value: title },
		]
	},
	referenceKey: (instance) => instance.data.position,
	dataRules: (instance) => ({
		title: [v.required()],
		content: [v.required()],
	}),
})

ConfigService.define('SiteNavbarLinks', {
	name: 'Sitio/Links de navegación',
	multiple: true,
	program: true,
	fields: {
		text: { type: 'string', label: 'Texto' },
		position: { type: 'number', label: 'Posición', columns: 6 },
		link: {
			customType: 'Url',
			label: 'Link URL',
		},
	},
	activeDataGetter: (data) => {
		return data.sort((a, b) => a.position - b.position)
	},
	reference: async (instance) => [{ type: 'text', value: instance.data.text }],
	referenceKey: (instance) => instance.data.position,
	dataRules: (instance) => ({
		text: [v.required()],
		position: [v.required(), v.int(), v.gte(1)],
		link: [v.required()],
	}),
})
/*
ConfigService.define('HomeCategoriesFeatured', {
	name: 'Home/Cajas A',
	multiple: true,
	program: true,
	fields: {
		position: {
			type: 'number',
			label: 'Posición en el layout',
			defaultValue: 1,
			columns: 4,
		},
		imgFirst: {
			customType: 'Image',
			fileKey: 'imgFirstFile',
			label: 'Imagen de la Primera Tarjeta',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '800 x 425px',
				wider: true,
			},
		},
		imgFirstMobile: {
			customType: 'Image',
			fileKey: 'imgFirstMobileFile',
			label: 'Imagen de la Primera Tarjeta para Mobile',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '600 x 600px',
				wider: true,
			},
		},
		ctaTextFirstBox: {
			type: 'string',
			label: 'Texto del botón de la primera caja',
			defaultValue: 'Personalizar',
		},
		LinkFirstBox: {
			customType: 'Url',
			label: 'Link URL del botón de la primera caja',
		},
		imgSecond: {
			customType: 'Image',
			fileKey: 'imgSecondFile',
			label: 'Imagen de la Segunda Tarjeta',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '800 x 425px',
				wider: true,
			},
		},
		imgSecondMobile: {
			customType: 'Image',
			fileKey: 'imgSecondMobileFile',
			label: 'Imagen de la Segunda Tarjeta para Mobile',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '600 x 600px',
				wider: true,
			},
		},
		ctaTextSecondBox: {
			type: 'string',
			label: 'Texto del botón de la segunda caja',
			defaultValue: 'Personalizar',
		},
		LinkSecondBox: {
			customType: 'Url',
			label: 'Link URL del botón de la segunda caja',
		},
		ctaTextSection: {
			type: 'string',
			label: 'Texto del botón de sección',
			defaultValue: 'Personalizar',
		},
		ctaLinkSection: {
			customType: 'Url',
			label: 'Link URL del botón de la sección',
		},
	},
	activeDataGetter: (data) => {
		return data.sort((a, b) => a.position - b.position)
	},
	reference: (instance) => {
		let { imgFirst } = instance.data
		return [
			{ type: 'text', value: `#${instance.data.position || 1}` },
			{ type: 'image', value: imgFirst },
		]
	},
	referenceKey: (instance) => instance.data.position,
	dataRules: (instance) => ({
		position: [v.required(), v.int(), v.gte(1)],
		ctaTextFirstBox: [v.required()],
		LinkFirstBox: [v.required()],
		ctaTextSecondBox: [v.required()],
		LinkSecondBox: [v.required()],
		ctaTextSection: [],
		ctaLinkSection: [],
	}),
	filesRules: (instance, isNew) => ({
		imgFirstFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 800, h: 425 })],
		imgFirstMobileFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 600, h: 600 })],
		imgSecondFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 800, h: 425 })],
		imgSecondMobileFile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 600, h: 600 })],
	}),
	filesUpload: (instance) => ({
		imgFirstFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_featured_box2_first_cats_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgFirst', url)
			},
		},
		imgFirstMobileFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_featured_box2_first_mobile_cats_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgFirstMobile', url)
			},
		},
		imgSecondFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_featured_box2_second_cats_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgSecond', url)
			},
		},
		imgSecondMobileFile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_featured_box2_second_mobile_cats_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgSecondMobile', url)
			},
		},
	}),
})

ConfigService.define('HomeHighDefBox', {
	name: 'Home/Caja B',
	multiple: false,
	program: true,
	fields: {
		img: {
			customType: 'Image',
			fileKey: 'img',
			label: 'Imagen en alta definición',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '1379 x 620px',
				wider: true,
			},
		},
		imgMobile: {
			customType: 'Image',
			fileKey: 'imgMobile',
			label: 'Imagen en alta definición para mobile',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '600 x 1000px',
				wider: true,
			},
		},
		ctaText: {
			type: 'string',
			label: 'Texto del botón',
			defaultValue: 'Comprá ahora',
		},
		Link: {
			customType: 'Url',
			label: 'Link URL',
		},
	},
	reference: (instance) => {
		let { img } = instance.data
		return [
			{ type: 'image', value: img },
			{ type: 'text', value: instance.data.ctaText },
		]
	},
	referenceKey: (instance) => instance.data.ctaTextFirstBox,
	dataRules: (instance) => ({
		ctaText: [],
		Link: [],
	}),
	filesRules: (instance, isNew) => ({
		img: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 1379, h: 620 })],
		imgMobile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 600, h: 1000 })],
	}),
	filesUpload: (instance) => ({
		img: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_high_def_img_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('img', url)
			},
		},
		imgMobile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_high_def_img_mobile_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgMobile', url)
			},
		},
	}),
})

ConfigService.define('HomeHalfImageBox', {
	name: 'Home/Caja C',
	multiple: false,
	program: true,
	fields: {
		img: {
			customType: 'Image',
			fileKey: 'img',
			label: 'Imagen para mostrar',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '688 x 440px',
				wider: true,
			},
		},
		ctaText: {
			type: 'string',
			label: 'Texto del botón',
			defaultValue: 'Comprá ahora',
		},
		Link: {
			customType: 'Url',
			label: 'Link URL',
		},
	},
	reference: (instance) => {
		let { img } = instance.data
		return [
			{ type: 'image', value: img },
			{ type: 'text', value: instance.data.ctaText },
		]
	},
	referenceKey: (instance) => instance.data.ctaTextFirstBox,
	dataRules: (instance) => ({
		ctaText: [],
		Link: [],
	}),
	filesRules: (instance, isNew) => ({
		img: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 688, h: 440 })],
	}),
	filesUpload: (instance) => ({
		img: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_half_width_img_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('img', url)
			},
		},
	}),
})

ConfigService.define('HomeUserReviews', {
	name: 'Home/Testimonios de usuarios',
	multiple: true,
	program: false,
	fields: {
		position: {
			type: 'number',
			label: 'Posición en carousel',
			defaultValue: 1,
			columns: 4,
		},
		img: {
			customType: 'Image',
			fileKey: 'img',
			label: 'Imagen para mostrar',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '213 x 440px',
				wider: false,
			},
		},
	},
	activeDataGetter: (data) => {
		return data.sort((a, b) => a.position - b.position)
	},
	reference: (instance) => {
		let { img, position } = instance.data
		return [
			{ type: 'text', value: `#${position || 1}` },
			{ type: 'image', value: img },
		]
	},
	referenceKey: (instance) => instance.data.position,
	filesRules: (instance, isNew) => ({
		img: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 213, h: 440 })],
	}),
	dataRules: (instance) => ({
		position: [v.required(), v.int(), v.gte(1)],
		//link: [v.required()],
	}),
	filesUpload: (instance) => ({
		img: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_user_review_img_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('img', url)
			},
		},
	}),
})

ConfigService.define('HomeNewsletterBackground', {
	name: 'Home/Imagen de fondo sección newsletter',
	multiple: false,
	program: false,
	fields: {
		img: {
			customType: 'Image',
			fileKey: 'img',
			label: 'Imagen para mostrar',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '1920 x 352px',
				wider: true,
			},
		},
		imgMobile: {
			customType: 'Image',
			fileKey: 'imgMobile',
			label: 'Imagen para mostrar en mobile',
			watch: (newVal, oldVal) => Imager.unlink(oldVal),
			componentAttrs: {
				requirements: '536 x 352px',
				wider: true,
			},
		},
	},

	reference: (instance) => {
		let { img } = instance.data
		return [{ type: 'image', value: img }]
	},
	referenceKey: (instance) => instance.data.img,
	filesRules: (instance, isNew) => ({
		img: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 1920, h: 352 })],
		imgMobile: [v.requiredIf(isNew), v.file.isImage(), v.file.dimension({ w: 536, h: 352 })],
	}),
	filesUpload: (instance) => ({
		img: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_newsletter_background_img_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('img', url)
			},
		},
		imgMobile: {
			filename: ({ filename }) => {
				return filenamer.safe(filename, {
					name: `home_newsletter_background_mobile_img_${Date.now()}`,
				})
			},
			dest: `public/uploads/configs`,
			done: async ({ upload }) => {
				let { url } = await Imager.jpg(upload.path)
				instance.setData('imgMobile', url)
			},
		},
	}),
})

ConfigService.define('SiteNavbarLinks', {
	name: 'Sitio/Links de navegación',
	multiple: true,
	program: true,
	fields: {
		text: { type: 'string', label: 'Texto' },
		position: { type: 'number', label: 'Posición', columns: 6 },
		link: {
			customType: 'Url',
			label: 'Link URL',
		},
	},
	activeDataGetter: (data) => {
		return data.sort((a, b) => a.position - b.position)
	},
	reference: async (instance) => [{ type: 'text', value: instance.data.text }],
	referenceKey: (instance) => instance.data.position,
	dataRules: (instance) => ({
		text: [v.required()],
		position: [v.required(), v.int(), v.gte(1)],
		link: [v.required()],
	}),
})
*/
