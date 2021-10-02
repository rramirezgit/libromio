const { Op } = require('sequelize')
const { db } = require('#/express')
const { ApiRes, emitter, Cache } = require('#/utils')

class CollectionService {
	static async getAll() {
		return await Cache.get('collections')
	}

	static async get(idOrKeyname) {
		let all = await this.getAll()
		if (isNaN(idOrKeyname)) {
			return all.find((collection) => collection.keyname == idOrKeyname)
		} else {
			return all.find((collection) => collection.id == idOrKeyname)
		}
	}

	/**
	 * @param {{
	 * 	id?: number,
	 * 	keyname: string,
	 * 	filters: Array<{
	 * 		type: string,
	 * 		op: string,
	 * 		value (string|number)
	 * 	}>
	 * }} data
	 */
	static async save(data = {}) {
		let isNew = !data.id
		let apiRes = ApiRes()
		//console.dir(data, { depth: null })
		await db.$transaction(async (t) => {
			let collection = isNew
				? db.Collection.build()
				: await db.Collection.findByPk(data.id, { lock: true })

			if (!collection) {
				apiRes.error('La colección es inexistente o ha sido eliminada')
				throw null
			}

			let results = await collection.setAndValidate({
				keyname: data.keyname,
				filters: data.filters || [],
			})

			apiRes.validation(results, 'collection')
			if (apiRes.hasErrors()) throw null

			await collection.save()
			Cache.delete('collections')
			await this._updateCollectionProducts(collection)

			let subEvent = isNew ? 'CREATE' : 'UPDATE'
			await emitter.emit('Collection.SAVE', { id: collection.id, subEvent, t })

			apiRes.data({ collectionId: collection.id })
		})
		return apiRes
	}

	static async delete(id) {
		let collection = await this.get(id)
		if (collection) {
			await db.$transaction(async (t) => {
				const deleteEvent = emitter.managedEvent('Collection.DELETE')
				await emitter.emit('Collection.BEFORE_DELETE', { id: collection.id, t, deleteEvent })
				await collection.destroy()
				Cache.delete('collections')
				await deleteEvent.emit({ id: collection.id, t })
			})
		}
		return ApiRes()
	}

	static async _updateAll() {
		await db.$transaction(async (t) => {
			for (let collection of await this.getAll()) {
				await this._updateCollectionProducts(collection)
			}
		})
	}

	static async _updateCollectionProducts(collection) {
		await db.$transaction(async (t) => {
			let added = await this.__insertMatched(collection)
			let removed = await this.__deleteNonMatched(collection)
			if (added || removed) {
				await emitter.emit(`Collection.products.SET`, { id: collection.id, t })
			}
		})
	}

	static async _updateProductCollections(productId) {
		await db.$transaction(async (t) => {
			for (let collection of await this.getAll()) {
				let added = await this.__insertMatched(collection, productId)
				let removed = added ? false : await this.__deleteNonMatched(collection, productId)
				let subEvent = added ? 'ADD' : removed ? 'REMOVE' : null
				if (subEvent) {
					await emitter.emit(`Collection.products.SET`, { id: collection.id, productId, subEvent, t })
				}
			}
		})
	}

	static async __insertMatched(collection, productId = null) {
		let { id, filters } = collection
		let builder = db
			.$rawQueryBuilder('SELECT')
			.col(':collectionId', 'Product.id', { collectionId: id })
			.table('Product')
			.join(
				'LEFT JOIN CollectionHasProduct chp ON chp.productId = Product.id AND chp.collectionId = :collectionId'
			)
			.where(!!productId, 'Product.id = :productId', { productId })
			.where('chp.id IS NULL')
			.group('Product.id')

		this.__applyFilters(builder, filters)

		let [result, affectedRows] = await db
			.$rawQueryBuilder('INSERT')
			.table('CollectionHasProduct')
			.col('collectionId', 'productId')
			.insertSelect(...builder.export())
			.run()

		return affectedRows
	}

	static async __deleteNonMatched(collection, productId = null) {
		let { id, filters } = collection
		let builder = db
			.$rawQueryBuilder('SELECT')
			.col('Product.id')
			.table('Product')
			.where(!!productId, 'Product.id = :productId', { productId })
			.group('Product.id')

		this.__applyFilters(builder, filters)

		let [result, affectedRows] = await db
			.$rawQueryBuilder('DELETE')
			.deleteTable('chp')
			.table('CollectionHasProduct chp')
			.subSelectJoin('LEFT JOIN', builder, 'sub', 'sub.id = chp.productId')
			.where('chp.collectionId = :collectionId', { collectionId: id })
			.where(!!productId, 'chp.productId = :productId', { productId })
			.where('sub.id IS NULL')
			.run()

		return affectedRows
	}

	static __applyFilters(builder, filters) {
		for (let filter of filters) {
			if (filter.type == 'category') this.___applyCategoryFilter(builder, filter)
			else if (filter.type == 'tag') this.___applyTagFilter(builder, filter)
			else if (filter.type == 'product') this.___applyProductFilter(builder, filter)
		}
	}

	static ___applyCategoryFilter(builder, filter) {
		if (!builder._phcatJoined) {
			builder._phcatJoined = true
			builder.join('JOIN ProductHasCategory phcat ON phcat.productId = Product.id')
		}

		let bool = filter.op == 'in' ? 'true' : 'false'
		let conditions = filter.val.map((categoryId) => {
			let key = builder.$uniqParam(categoryId)
			return `SUM(phcat.categoryId = :${key}) = ${bool}`
		})
		conditions = filter.op == 'in' ? builder.$any(...conditions) : builder.$all(...conditions)
		builder.having(conditions)
	}

	static ___applyTagFilter(builder, filter) {
		if (!builder._phtagJoined) {
			builder._phtagJoined = true
			builder.join('LEFT JOIN ProductHasTag phtag ON phtag.productId = Product.id')
		}

		let isNegation = ['not_all', 'not_any'].includes(filter.op)
		let bool = isNegation ? 'false' : 'true'
		let conditions = filter.val.map((tagId) => {
			let key = builder.$uniqParam(tagId)
			return `SUM(IFNULL(phtag.tagId,0) = :${key}) = ${bool}`
		})
		if (['any', 'not_all'].includes(filter.op)) {
			conditions = builder.$any(...conditions)
		} else if (['all', 'not_any'].includes(filter.op)) {
			conditions = builder.$all(...conditions)
		}
		builder.having(conditions)
	}

	static ___applyProductFilter(builder, filter) {
		let oper = filter.op == 'in' ? 'IN' : 'NOT IN'
		let key = builder.$uniqParam(filter.val)
		builder.where(`Product.id ${oper} (:${key})`)
	}
}

Cache.preset('collections', {
	data: async () => await db.Collection.findAll(),
})
emitter.on(false, 'Product.tags.SET', async ({ id, bulk }) => {
	if (bulk) {
		await CollectionService._updateAll()
	} else {
		await CollectionService._updateProductCollections(id)
	}
})
emitter.on(false, 'Product.category.SET', async ({ id, bulk, categoryId }) => {
	if (bulk) {
		if (!categoryId) await CollectionService._updateAll()
	} else {
		await CollectionService._updateProductCollections(id)
	}
})
emitter.on(false, 'Product.SAVE', async ({ id, subEvent }) => {
	if (bulk) {
		await CollectionService._updateAll()
	} else if (subEvent == 'CREATE') {
		await CollectionService._updateProductCollections(id)
	}
})
emitter.on('Product.@FULL_SAVE', async ({ productId }) => {
	await CollectionService._updateProductCollections(productId)
})
module.exports = CollectionService
