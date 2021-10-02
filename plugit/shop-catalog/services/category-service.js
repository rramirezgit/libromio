const { db } = require('#/express')
const { ApiRes, emitter, Cache } = require('#/utils')

class CategoryService {
	static async getAll(
		/*{
			hasProducts: Boolean,
			bottomCategories: Boolean,
		}*/
		filters = {}
	) {
		let all = await Cache.get('categories')
		if (!filters || !Object.values(filters).length) return all
		if (filters.sortBy == 'menuPos') {
			all.sort((a, b) => {
				if (!a.menuPos) return 1
				if (!b.menuPos) return -1
				return a.menuPos - b.menuPos
			})
		}
		return all.filter((cat) => {
			if (filters.hasProducts !== undefined) {
				if (cat.hasProducts != filters.hasProducts) return false
			}
			if (filters.bottomCategories) {
				if (all.find((_cat) => _cat.parentId == cat.id)) return false
			}
			return true
		})
	}

	static async save(
		/*{
			id?,
			parentId?,
			name,
			menuPos?
		}
		*/
		data = {}
	) {
		let isNew = !data.id
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let category = isNew ? db.Category.build() : await db.Category.findByPk(data.id)

			if (!category) {
				apiRes.error('La categoría es inexistente o ha sido eliminada')
				throw null
			}

			let results = await category.setAndValidate({
				parentId: data.parentId,
				name: data.name,
				menuPos: data.menuPos,
			})

			apiRes.validation(results, 'category')
			if (results !== true) throw null

			let parent = data.parentId && (await db.Category.findByPk(data.parentId))
			let pos = parent ? parent.pos + 1 : 1
			let fullUrlName = parent ? `${parent.fullUrlName} ${category.name}` : category.name
			let urlName = category.name
			category.set({ urlName, fullUrlName, pos })

			await category.save()
			Cache.delete('categories')

			apiRes.data({ categoryId: category.id })

			let subEvent = isNew ? 'CREATE' : 'UPDATE'
			await emitter.emit('Category.SAVE', { id: category.id, subEvent, t })
		})
		return apiRes
	}

	static async delete(id) {
		let category = await this.get(id)
		if (category) {
			await db.$transaction(async (t) => {
				const deleteEvent = emitter.managedEvent('Category.DELETE')
				await emitter.emit('Category.BEFORE_DELETE', { id: category.id, t, deleteEvent })
				await category.destroy()
				Cache.delete('categories')
				await deleteEvent.emit({ id: category.id, t })
			})
		}
		return ApiRes()
	}

	static async getTree(filters) {
		let all = await this.getAll(filters)
		let categories = all.filter((cat) => cat.pos == 1)
		return await this._recursiveTree(categories, all)
	}

	static async get(catOrId, withTree = false) {
		let id = typeof catOrId == 'object' ? catOrId.id : catOrId
		let all = await Cache.get('categories')
		let category = all.find((cat) => cat.id == id)
		if (!category) return null
		if (withTree) {
			return (await this._recursiveTree([category], all))[0]
		} else {
			return category
		}
	}

	static async hasChildren(catOrId) {
		let category = await this.get(catOrId)
		let all = await Cache.get('categories')
		return category && !!all.find((cat) => cat.parentId == category.id)
	}

	static async isBottomCategory(catOrId) {
		return !(await this.hasChildren(catOrId))
	}

	static async getFamily(catOrId) {
		let cat = await this.get(catOrId)
		let family = [cat]
		while (cat.parentId) {
			let parent = await this.get(cat.parentId)
			family.unshift(parent)
			cat = parent
		}
		return family
	}

	static async getFamilyName(catOrId, joiner = '>') {
		let family = await this.getFamily(catOrId)
		return family.map((cat) => cat.name).join(` ${joiner} `)
	}

	static async _recursiveTree(categories, all = null) {
		all = all || (await Cache.get('categories'))
		for (let category of categories) {
			category.children = all.filter((cat) => cat.parentId == category.id)
			await this._recursiveTree(category.children, all)
		}
		return categories
	}
}

Cache.preset('categories', {
	data: async () => {
		return await db.Category.findAll({ order: ['name'] })
	},
	filter: (data) => [...data],
})

module.exports = CategoryService
