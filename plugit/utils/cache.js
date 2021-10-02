const { cloneDeep } = require('lodash')
const moment = require('moment')
const items = {}
const presets = {}

let _getPresetItemKey = (key) => `_#${key}_`
let _getPresetData = async (key, ...args) => {
	let opts = presets[key]
	let itemKey = _getPresetItemKey(key)
	if (opts.key) itemKey += opts.key(...args) || ''

	let item = items[itemKey]
	let shoudReset =
		item === undefined ||
		(opts.duration && _isPresetDurationExpired(opts.duration, item.at)) ||
		(opts.isExpired && (await opts.isExpired(item.data, ...args)))

	if (shoudReset) {
		item = {
			data: await opts.data(...args),
			at: moment(),
		}
		Cache.set(itemKey, item)
	}

	let data = item.data
	if (opts.clone) data = cloneDeep(data)

	if (opts.filter) {
		return await opts.filter(data, ...args)
	} else {
		return data
	}
}

let _isPresetDurationExpired = (duration, date) => {
	let [n, measure] = duration.split(' ')
	n = Number(n)
	measure += measure.endsWith('s') ? '' : 's'
	let isExpired = moment().diff(date, measure) >= n
	return isExpired
}

class Cache {
	static async get(key, ...presetArgs) {
		if (presets[key]) {
			return await _getPresetData(key, ...presetArgs)
		} else {
			return items[key]
		}
	}

	static set(key, data) {
		items[key] = data
	}

	static delete(key, ...presetArgs) {
		if (typeof key == 'function') {
			for (let k in items) {
				if (key(k)) delete items[k]
			}
		} else if (presets[key]) {
			let itemKey = _getPresetItemKey(key)
			if (presets[key].key) {
				if (presetArgs.length) {
					itemKey += presets[key].key(...presetArgs) || ''
					delete items[itemKey]
				} else {
					this.delete((_key) => _key.startsWith(itemKey))
				}
			} else {
				delete items[itemKey]
			}
		} else {
			delete items[key]
		}
	}

	static preset(
		presetKey,
		options = {
			/*
			data: (...args) => Any, 
			filter?: (data, ...args) => Any,
			key?: (...args) => String,
			isExpired?: (data, ...args) => Boolean,
			clone?: Boolean,
			durantion?: '1 day' / '3 minutes' / 'n seconds|minutes|hours|days|months|years'
			*/
		}
	) {
		presets[presetKey] = options
	}
}

module.exports = Cache
