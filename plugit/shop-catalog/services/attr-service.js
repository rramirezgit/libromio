const { db } = require('#/express')

class AttrService {
	static async findOrCreateValue(key, value) {
		if (Array.isArray(key)) {
			let attrVals = []
			for (let _key of key) {
				let attrVal = await this.findOrCreateValue(_key)
				if (attrVal && !attrVals.find((other) => other.id == attrVal.id)) {
					attrVals.push(attrVal)
				}
			}
			return attrVals
		}

		if (typeof key == 'object') {
			value = key.v || key.value
			key = (key.attrKey && key.attrKey.k) || key.k || key.key
		}

		let attrKey = await this.findOrCreateKey(key)
		value = value !== undefined && value !== null && String(value).trim()
		if (!attrKey || !value) return null

		let attrVal = await db.AttrVal.findOne(
			db
				.$queryBuilder()
				.joinWhere('attrKey', { id: attrKey.id })
				.where({ v: value })
				.get()
		)
		if (attrVal && attrVal.v != value) {
			await attrVal.update({ v: value })
		}
		if (attrVal) return attrVal

		attrVal = await db.AttrVal.create({ v: value })
		await attrVal.setAttrKey(attrKey)
		return attrVal
	}

	static async findOrCreateKey(key) {
		if (Array.isArray(key)) {
			let attrKeys = []
			for (let _key of key) {
				let attrKey = await this.findOrCreateKey(_key)
				if (attrKey && !attrKeys.find((other) => other.id == attrKey.id)) {
					attrKeys.push(attrKey)
				}
			}
			return attrKeys
		}

		if (typeof key == 'object') {
			key = key.k || key.key
		}

		key = key !== undefined && key !== null && String(key).trim()
		if (!key) return null

		let attrKey = await db.AttrKey.findOne({ where: { k: key } })
		if (attrKey && attrKey.k != key) {
			await attrKey.update({ k: key })
		}
		return attrKey || (await db.AttrKey.create({ k: key }))
	}
}

module.exports = AttrService
