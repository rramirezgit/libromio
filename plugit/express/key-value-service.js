const db = require('./db')
const KeyValueService = {}
const _defs = {}
const _cache = {}

KeyValueService.define = (k, type, opts = {}) => {
	let { getter, setter, defaultValue = null } = opts
	_defs[k] = { type, getter, setter, defaultValue, loading: false }
}

async function load(k) {
	if (!_defs[k]) return false
	if (_defs[k].loading === undefined) return

	if (_defs[k].loading === true) {
		return await new Promise((resolve) => {
			let itv = setInterval(() => {
				if (_defs[k].loading) return
				clearInterval(itv)
				resolve()
			}, 100)
		})
	}

	if (_defs[k].loading === false) {
		_defs[k].loading = true
		let { defaultValue } = _defs[k]
		if (defaultValue !== null) {
			defaultValue = valueSetter(k, defaultValue)
		}
		await db.KeyValueStore.findOrCreate({
			where: { k },
			defaults: { k, v: defaultValue },
		})
		delete _defs[k].loading
	}
}

function typeGetter(k, v) {
	switch (_defs[k].type) {
		case Boolean:
			return v === 'true'
		case Number:
			return Number(v)
		case Object:
		case Array:
			return JSON.parse(v)
		case String:
		default:
			return v
	}
}

function valueGetter(k, v) {
	v = typeGetter(k, v)
	return _defs[k].getter ? _defs[k].getter(v) : v
}

function typeSetter(k, v) {
	switch (_defs[k].type) {
		case Boolean:
			return v ? 'true' : 'false'
		case Object:
		case Array:
			return JSON.stringify(v)
		case Number:
		case String:
		default:
			return String(v)
	}
}

function valueSetter(k, v) {
	v = typeSetter(k, v)
	return _defs[k].setter ? _defs[k].setter(v) : v
}

KeyValueService.get = async (k, fromCache = true) => {
	if ((await load(k)) === false) return
	if (!fromCache || _cache[k] === undefined) {
		let data = await db.KeyValueStore.findOne({ where: { k } })
		_cache[k] = valueGetter(k, data.v)
	}
	return _cache[k]
}

KeyValueService.getForUpdate = async (k, updateFn) => {
	if ((await load(k)) === false) return
	return await db.$transaction(async (t) => {
		let data = await db.KeyValueStore.findOne({ where: { k }, lock: t.LOCK.UPDATE })
		let value = valueGetter(k, data.v)
		value = await updateFn(value)
		await data.update({ v: valueSetter(k, value) })
		_cache[k] = value
		return value
	})
}

KeyValueService.increment = async (k) => {
	return KeyValueService.getForUpdate(k, (value) => value + 1)
}

KeyValueService.set = async (k, v) => {
	await db.KeyValueStore.update({ v: valueSetter(k, v) }, { where: { k } })
	_cache[k] = v
}

module.exports = KeyValueService
