const _ = require('lodash')
const { Op } = require('sequelize')
const TagService = require('./tag-service')
const AttrService = require('./attr-service')
const CategoryService = require('./category-service')
const PriceConfigService = require('./price-config-service')
const PriceService = require('./price-service')
const ProductImageService = require('./product-image-service')
const StockService = require('./stock-service')
const { db } = require('#/express')
const { makePagination, ApiRes, Cron, emitter, v } = require('#/utils')

/**
 * @typedef {{
 * 	categoryId?: number|number[],
 * 	search?: string,
 * 	collectionId?: number,
 * 	brandId?: number,
 * 	fromPrice?: number,
 * 	toPrice?: number,
 * 	priceConfigId?: number,
 * 	attrs?: Array<{k: string, v: string, kId: number, vId: number}>
 * 	priceConfigKeyname?: string,
 * 	tagId?: number,
 * 	page?: number,
 * 	itemsPerPage?: number,
 * 	limit?: number,
 * 	pageLinksQty?: number,
 * 	sortBy?: ('name'|'price'|'sku'|'category'),
 * 	randomSort?: boolean,
 * 	sortDesc?: boolean,
 * 	scope?: string,
 * 	shopable?: boolean,
 * 	buyable?: boolean,
 * 	nonBuyableLast?: boolean,
 * 	custom?: function,
 * }} ProductsFilters
 */

class ProductService {
	/**
	 * @param {ProductsFilters} filters
	 * @returns {Promise<{products: Array<{}>, pagination: makePagination.Pagination}>}
	 */
	static async getAll(filters) {
		let filtersBuilder = this.getFiltersRawQueryBuilder(filters)
		let [countRows] = await db
			.$rawQueryBuilder('SELECT')
			.col('COUNT(DISTINCT(sub.id)) AS count')
			.subSelectTable(filtersBuilder, 'sub')
			.run()

		let itemsLength = countRows[0].count
		let pagination = this.makePagination(filters, itemsLength)

		if (!itemsLength) {
			return { products: [], pagination }
		}

		let [idsRows] = await this.getFiltersRawQueryBuilder(filters, true)
			.group('p.id')
			.limit(pagination.offset, pagination.itemsPerPage)
			.run()

		let ids = idsRows.map((row) => row.id)
		let contentScope = filters.scope
		let products = await db.Product.scope(contentScope).findAll(
			db
				.$queryBuilder()
				.where({ id: ids })
				.order(db.$fn('FIELD', db.$col('Product.id'), ...ids))
				.get()
		)

		return { products, pagination }
	}

	/**
	 * @param {ProductsFilters} filters
	 * @param {boolean} applySort
	 */
	static getFiltersRawQueryBuilder(filters = {}, applySort = false) {
		let builder = db
			.$rawQueryBuilder('SELECT')
			.col('p.id')
			.table('Product p')
			.group('p.id')
			.preset('categories', () => {
				builder.join(`JOIN ProductHasCategory phcat ON phcat.productId = p.id`)
				builder.join(`JOIN Category categories ON categories.id = phcat.categoryId`)
			})
			.preset('category', () => {
				builder.join('JOIN Category category ON category.id = p.categoryId')
			})
			.preset('CollectionHasProduct', (as = 'colhp') => {
				builder.join(`JOIN CollectionHasProduct ${as} ON ${as}.productId = p.id`)
			})
			.preset('variants', () => {
				builder.join('JOIN ProductVariant variants ON variants.productId = p.id')
			})
			.preset('mainPrices', () => {
				let { priceConfigId, priceConfigKeyname = 'default' } = filters
				builder.call('variants')
				builder.join(
					'JOIN ProductVariantPrice pvprice ON variants.id = pvprice.productVariantId AND variants.main = TRUE'
				)
				if (priceConfigId) {
					builder.where('pvprice.priceConfigId = :priceConfigId', { priceConfigId })
				} else {
					builder.join(
						'JOIN PriceConfig ON PriceConfig.id = pvprice.priceConfigId AND PriceConfig.keyname = :priceConfigKeyname',
						{ priceConfigKeyname }
					)
				}
			})

		let { buyable, shopable } = filters
		if (buyable !== undefined) {
			builder.where('p.buyable = :buyable', { buyable })
		}
		if (shopable !== undefined) {
			builder.where('p.shopable = :shopable', { shopable })
		} else {
			builder.where('p.deletedAt IS NULL')
		}

		let { search } = filters
		if (search) {
			// prettier-ignore
			let removeWords = ['a', 'con', 'de', 'para', 'por', 'y', 'o', 'la', 'las', 'el', 'los', ',', '.', ':']
			let words = search
				.split(' ')
				.filter((word) => !!word && !removeWords.includes(word))
				.slice(0, 5)

			if (words.length) {
				builder
					.call('variants')
					.col(`CONCAT(p.name,',',p.keywords,GROUP_CONCAT(variants.sku)) AS searchConcat`)
					.group('p.id')
				words.forEach((word, i) => {
					builder.having(`searchConcat LIKE :word${i}`, { [`word${i}`]: `%${word}%` })
				})
			}
		}

		let { collectionId } = filters
		if (collectionId) {
			builder.call('CollectionHasProduct').where('colhp.collectionId = :collectionId', { collectionId })
		}

		let { tagId } = filters
		if (tagId) {
			builder
				.join('JOIN ProductHasTag phtag ON phtag.productId = p.id')
				.where('phtag.tagId = :tagId', { tagId })
		}

		let { categoryId } = filters
		if (categoryId) {
			builder.call('categories').where('categories.id = :categoryId', { categoryId })
		}

		let { brandId } = filters
		if (brandId) {
			builder.where('p.brandId = :brandId', { brandId })
		}

		let { attrs } = filters
		if (attrs) {
			builder.join(
				'LEFT JOIN ProductHasAttr p_attr ON p_attr.productId = p.id',
				'LEFT JOIN AttrVal p_atval ON p_atval.id = p_attr.attrValId',
				'LEFT JOIN AttrKey p_atkey ON p_atkey.id = p_atval.attrKeyId'
			)
			builder
				.call('variants')
				.join(
					'LEFT JOIN ProductVariantAttr pv_attr ON pv_attr.productVariantId = variants.id',
					'LEFT JOIN AttrVal pv_atval ON pv_atval.id = pv_attr.attrValId',
					'LEFT JOIN AttrKey pv_atkey ON pv_atkey.id = pv_atval.attrKeyId'
				)

			let conditions = attrs.map((attr, i) => {
				builder.params(`attrKey${i}`, attr.kId || attr.k).params(`attrVal${i}`, attr.vId || attr.v)
				let keyCol = attr.kId ? 'id' : 'k'
				let valCol = attr.vId ? 'id' : 'v'
				return builder.$any(
					`SUM(p_atkey.${keyCol} = :attrKey${i} AND p_atval.${valCol} = :attrVal${i})`,
					`SUM(pv_atkey.${keyCol} = :attrKey${i} AND pv_atval.${valCol} = :attrVal${i})`
				)
			})
			builder.having(...conditions)
		}

		let { fromPrice, toPrice } = filters

		fromPrice = isNaN(fromPrice) || fromPrice < 0 ? null : Number(fromPrice)
		toPrice = isNaN(toPrice) || toPrice <= 0 ? null : Number(toPrice)
		if (fromPrice && toPrice && toPrice < fromPrice) toPrice = null
		if (fromPrice) builder.call('mainPrices').where('pvPrice.price >= :fromPrice', { fromPrice })
		if (toPrice) builder.call('mainPrices').where('pvPrice.price <= :toPrice', { toPrice })

		if (applySort) {
			if (filters.nonBuyableLast) builder.order('p.buyable DESC')

			if (filters.randomize) {
				builder.order('RAND()')
			} else {
				let { sortBy, sortDesc } = filters
				let direction = sortDesc ? 'DESC' : 'ASC'
				switch (sortBy) {
					case 'name':
						builder.order(`p.name ${direction}`)
						break
					case 'categories':
						builder.call('category').order(`category.fullUrlName ${direction}`)
						break
					case 'sku':
						builder.call('variants').order(`variants.sku ${direction}`)
						break
					case 'price':
						builder.call('mainPrices').order(`pvprice.price ${direction}`)
						break
				}

				builder.order(`p.relevance DESC`)
				if (sortBy != 'name') builder.order(`p.name`)
			}
		}

		let { custom } = filters
		if (custom) custom(builder)

		return builder
	}

	/**
	 * @param {ProductsFilters} filters
	 * @param {number} itemsLength
	 * @returns {makePagination.Pagination}
	 */
	static makePagination(filters, itemsLength) {
		let { page, itemsPerPage, limit, pageLinksQty } = filters
		page = isNaN(page) || page < 1 ? null : parseInt(page)
		limit = limit || itemsPerPage
		limit = isNaN(limit) || limit < 1 ? null : parseInt(limit)
		pageLinksQty = isNaN(pageLinksQty) || pageLinksQty < 1 ? null : parseInt(pageLinksQty)

		let pagination = makePagination({
			page: page || 1,
			itemsPerPage: limit || 20,
			pageLinksQty: pageLinksQty || 7,
			itemsLength,
		})
		return pagination
	}

	static async getById(id, { scope }) {
		return await db.Product.scope(scope).findByPk(id)
	}

	static async getByIds(ids, { scope }) {
		return await db.Product.scope(scope).findAll({ where: { id: ids } })
	}

	static async fullSave(
		/* 
		{
			id?,
			name, 
			unitMetric, 
			priceMetric, 
			brandId?, 
			categoryId, 
			keywords = [],
			active: Boolean,
			activeFrom: Date,
			tags: [{
				name
			}],
			images: [{
				id?,
			}],
			info: {
				description
			},
			hasUniqueVariant,
			variants: [{
				id?,
				sku,
				ean?,
				size,
				weight,
				metricFactor?,
				discountPct?,
				stock: { qty, deferredDelivery?, Date? },
				pvPrices: [{
					basePrice,
					extraDiscountPct,
					priceConfigId?,
					priceConfig: { id?, keyname? },
				}],
				attrs?: [{

				}]
			}],
			attrs?: [{
				v,
				attrKey: {k}
			}]
		} 
		*/
		data = {},
		/* 
		{
			image_[pos]: File
		} 
		*/
		files = {}
	) {
		let apiRes = ApiRes()
		//console.dir(data, { depth: null })
		await db.$transaction(async (t) => {
			const managedEvent = emitter.managedEvent('Product.@FULL_SAVE')

			await managedEvent.try(async () => {
				const productId = data.id

				// PRODUCT MAIN
				await (async () => {
					let isNew = !data.id
					let _apiRes = await this.save({ ...data, managedEvent })
					if (_apiRes.hasErrors()) {
						apiRes.validation(_apiRes.validation(), 'product')
						apiRes.error(_apiRes.error())
					} else {
						let product = _apiRes.data().product
						apiRes.data({ productId: product.id })
						managedEvent.onEmit(() => {
							let subEvent = isNew ? 'CREATE' : 'UPDATE'
							managedEvent.data({ productId: product.id, subEvent, t })
						})
					}
				})()

				// INFO
				await (async () => {
					let { description } = data.info || {}
					let _apiRes = await this.saveInfo({ productId, managedEvent, description })
					_apiRes.hasErrors() && apiRes.validation(_apiRes.validation(), 'product')
				})()

				// IMAGES
				await (async () => {
					let images = (data.images || []).map((imageData, i) => ({
						id: imageData.id,
						file: files[`image_${i}`],
					}))
					let _apiRes = await this.setImages({ productId, managedEvent, images })
					_apiRes.hasErrors() && apiRes.validation(_apiRes.validation())
				})()

				// CATEGORY
				await (async () => {
					let { categoryId } = data
					let _apiRes = await this.setCategory({ productId, managedEvent, categoryId })
					_apiRes.hasErrors() && apiRes.validation(_apiRes.validation(), 'product')
				})()

				// BRAND
				await (async () => {
					let { brandId } = data
					let _apiRes = await this.setBrand({ productId, managedEvent, brandId })
					_apiRes.hasErrors() && apiRes.validation(_apiRes.validation(), 'product')
				})()

				// TAGS
				await (async () => {
					let { tags = [] } = data
					await this.setTags({ productId, managedEvent, tags })
				})()

				// ATTRS
				await (async () => {
					let { attrs = [] } = data
					await this.setAttrs({ productId, managedEvent, attrs })
				})()

				// VARIANTS
				await (async () => {
					let { variants = [], hasUniqueVariant } = data
					for (let [i, variant] of variants.entries()) {
						variant.digitalFile = files[`digitalFile_${i}`]
					}
					let _apiRes = await this.setVariants({ productId, hasUniqueVariant, managedEvent, variants })
					_apiRes.hasErrors() && apiRes.validation(_apiRes.validation(), 'product')
				})()

				if (apiRes.hasErrors()) {
					throw null
				}

				await managedEvent.emit()
			})
		})
		return apiRes
	}

	/**
	 * @param {{
	 * 	id?: string,
	 * 	managedEvent?: string,
	 * 	name: string,
	 * 	unitMetric: string,
	 * 	priceMetric: string,
	 * 	keywords: Array<string>,
	 * 	hasUniqueVariant: boolean,
	 * 	active: boolean,
	 * 	activeFrom: (string|Date),
	 * }} data
	 */
	static async save(data = {}) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let { id, managedEvent } = data
			let isNew = !id
			let product = isNew ? db.Product.build() : await db.Product.findByPk(id, { lock: true })

			if (!product) {
				apiRes.error('El producto es inexistente o ha sido eliminado')
				throw null
			}

			let def = {
				name: undefined,
				unitMetric: undefined,
				priceMetric: undefined,
				hasUniqueVariant: isNew ? true : undefined,
				active: isNew ? true : undefined,
				activeFrom: undefined,
				keywords: isNew ? '' : undefined,
				relevance: isNew ? 0 : undefined,
				vAttrsPos: undefined,
			}
			data = _.pickBy(_.defaults(data, def), (v, k) => k in def && (isNew || v !== undefined))

			if (data.hasUniqueVariant) {
				data.vAttrsPos = null
			}

			let results = await product.setAndValidate(data)
			if (results !== true) {
				apiRes.validation(results)
				throw null
			}

			apiRes.data({ product })

			let fn = async () => {
				await product.save()
				let subEvent = isNew ? 'CREATE' : 'UPDATE'
				await emitter.emit('Product.SAVE', { id: product.id, subEvent, managedEvent, t })
			}

			managedEvent ? await managedEvent.onEmit(fn) : await fn()
		})
		return apiRes
	}

	/**
	 * @param {{
	 * 	productId?: string,
	 * 	hasUniqueVariant?: boolean,
	 * 	managedEvent?: string,
	 * 	variants: Array<{
	 * 		id?: string,
	 * 		sku: string,
	 * 		ean?: string,
	 * 		size: number,
	 * 		weight: number,
	 * 		metricFactor: number,
	 * 		type: string,
	 * 		digitalFile: {},
	 * 		position: number,
	 * 		main: boolean,
	 * 		stock: {
	 * 			qty?: number,
	 * 			deferredDelivery?: number,
	 * 			availabilityDate?: (string|Date),
	 * 			maxBuyableQty?: number,
	 * 			infiniteQty?: boolean,
	 * 		},
	 * 		pvPrices: Array<{
	 * 			basePrice: number,
	 * 			priceConfigId: number,
	 * 			extraDiscountPct: number,
	 * 		}>,
	 * 		attrs?: Array<{}>
	 * 	}>
	 * }} data
	 */
	static async setVariants(data = {}) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let { productId, managedEvent, variants: variantsData = [] } = data

			let product = productId ? await db.Product.findByPk(productId) : null
			if (productId && !product) {
				apiRes.error('El producto es inexistente o ha sido eliminado')
				throw null
			}
			let { hasUniqueVariant } = data
			if (hasUniqueVariant === undefined) {
				hasUniqueVariant = product?.hasUniqueVariant
			}
			if (hasUniqueVariant) {
				variantsData = variantsData.slice(0, 1)
			}

			let variants = []
			let skus = variantsData.map(({ sku }) => sku)

			let mainFound = false
			variantsData.forEach((vData) => {
				if (mainFound || !vData.main) vData.main = false
				else if (vData.main) mainFound = true
			})
			if (!mainFound && variantsData.length) variantsData[0].main = true

			for (let [i, vData] of variantsData.entries()) {
				// VARIANT
				const variantManagedEvent = emitter.managedEvent('ProductVariant.@FULL_SAVE')
				const isNew = !vData.id
				const variant = isNew ? db.ProductVariant.build() : await db.ProductVariant.findByPk(vData.id)
				const validationKey = `variant_${i}`
				variants.push(variant)

				if (!variant) {
					apiRes.validation(
						`${validationKey}.id`,
						'La variante de producto es inexistente o ha sido eliminada'
					)
					continue
				}

				let results = await v.validateAll(vData, {
					sku: [
						v.required(),
						/*(value) => {
							let len = skus.filter((sku) => sku == value).length
							return len > 1 ? 'El sku debe ser único por cada variante' : true
						},
						v.unique(variant, 'sku'),*/
					],
					size: [v.required(), v.number(), v.gte(0)],
					weight: [v.required(), v.number(), v.gte(0)],
					metricFactor: [v.ifNotEmpty(), v.number(), v.gt(0)],
					type: [v.in(['physical', 'digital'])],
					digitalFile:
						vData.type == 'digital' ? [v.requiredIf(!variant.digital), v.file.maxSize(500000)] : [],
				})

				if (results !== true) {
					apiRes.validation(results, validationKey)
				}

				// STOCK
				await (async () => {
					let { stock = {} } = vData
					let _apiRes = await StockService.save({
						variantId: vData.id,
						managedEvent: variantManagedEvent,
						qty: stock.qty,
						deferredDelivery: stock.deferredDelivery,
						availabilityDate: stock.availabilityDate,
						maxBuyableQty: stock.maxBuyableQty,
						infiniteQty: stock.infiniteQty,
					})
					_apiRes.hasErrors() && apiRes.validation(_apiRes.validation(), validationKey)
				})()

				// ATTRS
				await variantManagedEvent.onEmit(async ({ product }) => {
					let attrs = product.hasUniqueVariant ? [] : await AttrService.findOrCreateValue(vData.attrs)
					await variant.setAttrs(attrs)
				})

				// PRICES
				for (let priceData of vData.pvPrices) {
					let priceConfig = await PriceConfigService.get(
						priceData.priceConfigId || priceData.priceConfig.id
					)
					if (!priceConfig) continue

					let results = await v.validateAll(priceData, {
						basePrice: [v.required(), v.price()],
						extraDiscountPct: [v.ifNotEmpty(), v.int({ negative: true }), v.lte(99)],
					})

					if (results !== true) {
						apiRes.validation(results, `${validationKey}.pvPrice.${priceConfig.keyname}`)
						continue
					}

					await variantManagedEvent.onEmit(async ({ variantId }) => {
						await PriceService.update(
							variantId,
							priceConfig.id,
							priceData.basePrice,
							priceData.extraDiscountPct
						)
					})
				}

				let fn = async ({ productId }) => {
					let product = await db.Product.findByPk(productId)
					variant.set({
						productId,
						sku: vData.sku,
						ean: vData.ean,
						size: vData.size,
						weight: vData.weight,
						metricFactor: product.priceMetric ? vData.metricFactor : 1,
						type: vData.type,
						digitalFile: vData.digitalFile,
						position: vData.position !== undefined ? vData.position : i,
						main: vData.main,
					})
					await variant.uploadFile('digitalFile')
					await variant.save()
					let subEvent = isNew ? 'CREATE' : 'UPDATE'
					await emitter.emit('ProductVariant.SAVE', { id: variant.id, subEvent, managedEvent, t })
					await variantManagedEvent.emit({ variantId: variant.id, product, subEvent, t })
				}

				managedEvent ? await managedEvent.onEmit(fn) : await fn({ productId })
			}

			if (apiRes.hasErrors()) throw null

			apiRes.data({ variants })

			let fn = async ({ productId }) => {
				let variantsIds = variants.map(({ id }) => id)
				await db.ProductVariant.destroy({
					where: { id: { [Op.notIn]: variantsIds }, productId },
				})
				await emitter.emit('Product.variants.SET', { id: productId, variantsIds, managedEvent, t })
			}

			managedEvent ? await managedEvent.onEmit(fn) : await fn({ productId })
		})
		return apiRes
	}

	/**
	 * @param {{
	 * 	productId?: string,
	 * 	managedEvent?: string,
	 * 	images: Array<{
	 *		 	id?: number,
	 * 		file?: Object
	 * 	}>
	 * }} data
	 */
	static async setImages(data = {}) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let savedImages = []
			let { images, productId, managedEvent } = data
			for (let [i, image] of (images || []).entries()) {
				let _apiRes = await ProductImageService.save({
					id: image.id,
					file: image.file,
					pos: i,
					productId,
					managedEvent,
				})
				if (_apiRes.hasErrors()) {
					apiRes.validation(_apiRes.validation(), `image_${i}`)
				} else {
					savedImages.push(_apiRes.data().image)
				}
			}

			if (apiRes.hasErrors()) throw null
			apiRes.data({ images: savedImages })

			let fn = async ({ productId }) => {
				let ids = savedImages.map(({ id }) => id)
				let rows = await db.ProductImage.findAll({
					where: { id: { [Op.notIn]: ids }, productId },
					raw: true,
				})
				for (let { id } of rows) {
					await ProductImageService.delete(id, managedEvent)
				}
			}

			managedEvent ? await managedEvent.onEmit(fn) : await fn({ productId })
		})
		return apiRes
	}

	/**
	 * @param {{
	 * 	productId: string,
	 * 	managedEvent: Object,
	 * 	description: string,
	 * }} data
	 */
	static async saveInfo(data = {}) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let { productId, managedEvent } = data
			let isNew = false
			let info = productId && (await db.ProductInfo.findOne({ where: { productId } }))
			if (!info) {
				isNew = true
				info = db.ProductInfo.build()
			}

			let def = { description: undefined }
			data = _.pickBy(_.defaults(data, def), (v, k) => k in def && (isNew || v !== undefined))

			let results = await info.setAndValidate(data)
			if (results === true) {
				apiRes.data({ info })
			} else {
				apiRes.validation(results, 'info')
				throw null
			}

			let fn = async ({ productId }) => {
				await info.set({ productId }).save()
				await emitter.emit('Product.info.SAVE', {
					id: productId,
					managedEvent,
					t,
				})
			}

			managedEvent ? await managedEvent.onEmit(fn) : await fn({ productId })
		})
		return apiRes
	}

	/**
	 * @param {{
	 * 	productId: string,
	 * 	managedEvent: Object,
	 * 	categoryId: number
	 * }} data
	 */
	static async setCategory(data = {}) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let { productId, managedEvent, categoryId } = data
			let result = await v.validate(categoryId, [
				v.required(),
				v.validModel(db.Category),
				async (value) => {
					let hasChildren = await CategoryService.hasChildren(value)
					return hasChildren ? 'No se puede asignar una categoría que contenga subcategorías' : true
				},
			])
			if (result !== true) {
				apiRes.validation('categoryId', result)
				throw null
			}
			let fn = async ({ productId }) => {
				let product = await db.Product.findByPk(productId)
				if (product.categoryId == categoryId) return
				await product.update({ categoryId })
				let family = await CategoryService.getFamily(categoryId)
				await product.setCategories(family)
				await emitter.emit('Product.category.SET', { id: productId, categoryId, t })
			}
			managedEvent ? await managedEvent.onEmit(fn) : await fn({ productId })
		})
		return apiRes
	}

	/**
	 * @param {{
	 * 	productId: string,
	 * 	managedEvent: Object,
	 * 	brandId: number
	 * }} data
	 */
	static async setBrand(data = {}) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let { productId, managedEvent, brandId } = data
			let result = await v.validate(brandId, [v.ifNotEmpty(), v.validModel(db.Brand)])
			if (result !== true) {
				apiRes.validation('brandId', result)
				throw null
			}
			let fn = async ({ productId }) => {
				let product = await db.Product.findByPk(productId)
				if (product.brandId == brandId) return
				await product.update({ brandId })
				await emitter.emit('Product.brand.SET', { id: productId, brandId, t })
			}
			managedEvent ? await managedEvent.onEmit(fn) : await fn({ productId })
		})
		return apiRes
	}

	/**
	 * @param {{
	 * 	productId: string,
	 * 	managedEvent: Object,
	 * 	tags: Array<string|{name: string}>
	 * }} data
	 */
	static async setTags(data = {}) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let { productId, managedEvent } = data
			let fn = async ({ productId }) => {
				let product = await db.Product.findByPk(productId)
				let tags = await TagService.findOrCreate(data.tags || [])
				await product.setTags(tags)
				await emitter.emit('Product.tags.SET', { id: productId, t })
			}
			managedEvent ? await managedEvent.onEmit(fn) : await fn({ productId })
		})
		return apiRes
	}

	/**
	 * @param {{
	 * 	productId: string,
	 * 	managedEvent: Object,
	 * 	attrs: Array<{v: string, attrKey: {k: string}}>
	 * }} data
	 */
	static async setAttrs(data = {}) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let { productId, managedEvent } = data
			let fn = async ({ productId }) => {
				let product = await db.Product.findByPk(productId)
				let attrs = await AttrService.findOrCreateValue(data.attrs || [])
				await product.setAttrs(attrs)
				await emitter.emit('Product.attrs.SET', { id: productId, t })
			}
			managedEvent ? await managedEvent.onEmit(fn) : await fn({ productId })
		})
		return apiRes
	}

	static async _onCategoryDeleted(categoryId) {
		let [result, affectedRows] = await db
			.$rawQueryBuilder('DELETE')
			.deleteTable('phcat')
			.table('ProductHasCategory phcat')
			.join('JOIN Product p ON phcat.productId = p.id')
			.where('p.categoryId IS NULL')
			.run()

		if (affectedRows) {
			await emitter.emit('Product.category.SET', { bulk: true, categoryId: null })
		}
	}

	static async _onCategoryCreated(categoryId) {
		let category = await CategoryService.get(categoryId)
		if (!category || !category.parentId) return
		let { parentId } = category
		await db
			.$rawQueryBuilder('UPDATE')
			.table('Product p')
			.set('p.categoryId = :categoryId', { categoryId })
			.where('p.categoryId = :parentId', { parentId })
			.run()

		await db
			.$rawQueryBuilder('INSERT')
			.table('ProductHasCategory (productId, categoryId)')
			.insertSelect(
				...db
					.$rawQueryBuilder('SELECT')
					.col('id', 'categoryId')
					.table('Product')
					.where('categoryId = :categoryId', {
						categoryId: category.id,
					})
					.export()
			)
			.run()

		await emitter.emit('Product.category.SET', { bulk: true, categoryId })
	}
}

emitter.on('Category.DELETE', async ({ id }) => {
	await ProductService._onCategoryDeleted(id)
})

emitter.on('Category.SAVE', async ({ id, subEvent }) => {
	if (subEvent == 'CREATE') {
		await ProductService._onCategoryCreated(id)
	}
})

emitter.on('Tag.BEFORE_DELETE', async ({ id: tagId, deleteEvent }) => {
	if ((await db.ProductHasTag.count({ where: { tagId } })) == 0) return
	deleteEvent.onEmit(async () => {
		await emitter.emit('Product.tags.SET', { bulk: true, subEvent: 'REMOVE', tagId })
	})
})

module.exports = ProductService
