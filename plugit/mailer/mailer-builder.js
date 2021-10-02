const _builders = {}

class MailerBuilder {
	static register(key, opts = {}) {
		_builders[key] = opts
	}

	static get(key, data = {}) {
		let opts = _builders[key]
		if (!opts) return null
		return new MailerBuilder(key, opts, data)
	}

	static async unserializedData(key, serializedData) {
		let opts = _builders[key]
		if (!opts) return null
		let builder = new MailerBuilder(key, opts)
		return await builder.unserialize(serializedData)
	}

	constructor(key, opts, data = {}) {
		this._key = key
		this._opts = opts
		this._data = data
	}

	get key() {
		return this._key
	}

	async build(mailer) {
		for (let builder of this._getUsedBuilders()) {
			await builder.build(mailer)
		}
		await this._opts.build(mailer, this._data)
	}

	async serialize() {
		let serializedData = {}
		for (let builder of this._getUsedBuilders()) {
			Object.assign(serializedData, await builder.serialize())
		}
		let { serialize } = this._opts
		if (Array.isArray(serialize)) {
			for (let dataKey of serialize) {
				serializedData[dataKey] = this._data[dataKey]
			}
		} else if (serialize) {
			Object.assign(serializedData, await serialize(this._data))
		}

		return serializedData
	}

	async unserialize(serializedData) {
		let data = {}
		for (let builder of this._getUsedBuilders()) {
			Object.assign(data, await builder.unserialize(serializedData))
		}
		let { unserialize, serialize } = this._opts
		if (!unserialize && Array.isArray(serialize)) {
			unserialize = serialize
		}
		if (Array.isArray(unserialize)) {
			for (let dataKey of unserialize) {
				data[dataKey] = serializedData[dataKey]
			}
		} else if (unserialize) {
			Object.assign(data, await unserialize(serializedData))
		}
		return data
	}

	_getUsedBuilders() {
		if (!this._opts.use) return []
		return this._opts.use
			.map((key) => {
				return MailerBuilder.get(key, this._data)
			})
			.filter((builder) => !!builder)
	}
}

module.exports = MailerBuilder
