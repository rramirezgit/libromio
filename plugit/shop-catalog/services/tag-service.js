const { db } = require('#/express')
const { emitter, ApiRes } = require('#/utils')

class TagService {
	static async findOrCreate(name) {
		if (Array.isArray(name)) {
			let tags = []
			for (let _name of name) {
				let tag = await this.findOrCreate(_name)
				if (tag) tags.push(tag)
			}
			return tags
		}

		name = typeof name == 'object' ? name.name : name
		name = name.trim()
		if (!name) return null
		let [tag, created] = await db.Tag.findOrCreate({
			defaults: { name },
			where: { name },
		})
		if (created) {
			await emitter.emit('Tag.SAVE', { id: tag.id, subEvent: 'CREATE' })
		}
		return tag
	}

	static async delete(id) {
		let tag = await db.Tag.findByPk(id)
		if (tag) {
			await db.$transaction(async (t) => {
				const deleteEvent = emitter.managedEvent('Tag.DELETE')
				await emitter.emit('Tag.BEFORE_DELETE', { id: tag.id, deleteEvent, t })
				await tag.destroy()
				await deleteEvent.emit({ id: tag.id, t })
			})
		}
		return ApiRes()
	}
}

module.exports = TagService
