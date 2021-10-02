let maker = {}
maker.select = (data) => {
	return []
		.concat('SELECT')
		.concat(data.col.join(', '))
		.concat('FROM')
		.concat(data.table.join(', '))
		.concat(data.join || [])
		.concat(data.where ? ['WHERE', data.where.join(' AND ')] : [])
		.concat(data.group ? ['GROUP BY', data.group.join(', ')] : [])
		.concat(data.having ? ['HAVING', data.having.join(' AND ')] : [])
		.concat(data.order ? ['ORDER BY', data.order.join(', ')] : [])
		.concat(data.limit ? ['LIMIT', data.limit.join(', ')] : [])
}

maker.insert = (data) => {
	return []
		.concat('INSERT INTO')
		.concat(data.table)
		.concat(data.col ? ['(', data.col.join(', '), ')'] : [])
		.concat(data.values ? ['VALUES', data.values.map((values) => `(${values.join(', ')})`).join(',')] : [])
		.concat(data.insertSelect || [])
}

maker.update = (data) => {
	return []
		.concat('UPDATE')
		.concat(data.table)
		.concat(data.join || [])
		.concat('SET')
		.concat(data.set.join(', '))
		.concat(data.where ? ['WHERE', data.where.join(' AND ')] : [])
}

maker.delete = (data) => {
	return []
		.concat('DELETE')
		.concat(data.deleteTable || [])
		.concat('FROM')
		.concat(data.table)
		.concat(data.join || [])
		.concat(data.where ? ['WHERE', data.where.join(' AND ')] : [])
}

function RawQueryBuilder(db, type) {
	let _debug = false
	let data = {}
	let params = {}
	let presets = {}
	let uniqParamCount = 0
	let fns = [
		'col',
		'table',
		'join',
		'set',
		'where',
		'having',
		'group',
		'order',
		'limit',
		'insertSelect',
		'deleteTable',
		{ key: 'values', fn: (args) => data.values.push(args) },
	]
	let _parseArgs = (args) => {
		if (!args.length) return false
		let first = args[0]
		if (typeof first == 'boolean') {
			if (!first) return false
			args.shift()
		}
		let last = args[args.length - 1]
		if (typeof last == 'object') {
			this.params(args.pop())
		}
		return true
	}
	for (let fnData of fns) {
		if (typeof fnData == 'string') {
			fnData = {
				key: fnData,
				fn: (args) => (data[key] = data[key].concat(args)),
			}
		}
		let { key, fn } = fnData
		this[key] = (...args) => {
			if (!_parseArgs(args)) return this
			if (!data[key]) data[key] = []
			fn(args)
			return this
		}
	}
	this.$any = (...args) => `(${args.join(' OR ')})`
	this.$all = (...args) => `(${args.join(' AND ')})`
	this.$union = (...builders) => {
		builders.forEach((b) => this.params(b.getParams()))
		return builders.map((b) => b.make()).join(' UNION ')
	}
	this.$uniqParam = (value) => {
		uniqParamCount++
		let key = `uniqParam_${uniqParamCount}`
		this.params(key, value)
		return key
	}

	this.params = (key, value) => {
		Object.assign(params, typeof key == 'object' ? key : { [key]: value })
		return this
	}
	this.getParams = () => ({ ...params })
	this.preset = (key, multiple, fn) => {
		if (typeof multiple == 'function') {
			fn = multiple
			multiple = false
		}
		presets[key] = { fn, multiple, called: false }
		return this
	}
	this.call = (key, ...args) => {
		let preset = presets[key]
		if (preset && (preset.multiple || !preset.called)) {
			preset.called = true
			preset.fn(...args)
		}
		return this
	}

	this.make = () => {
		let query = maker[type.toLowerCase()](data)
		return query.join(' ')
	}
	this.export = () => {
		return [this.make(), this.getParams()]
	}
	this.subSelectTable = (builder, as) => {
		return this.table(`(${builder.make()}) ${as}`, builder.getParams())
	}
	this.subSelectJoin = (joinKeyword, builder, as, on) => {
		return this.join(`${joinKeyword} (${builder.make()}) ${as} ON ${on}`, builder.getParams())
	}
	this.if = (condition, fn) => {
		if (condition) fn(this)
		return this
	}
	this.debug = () => {
		_debug = true
		return this
	}
	this.run = async (opts = {}) => {
		if (_debug && process.env.NODE_ENV != 'production') {
			opts.logging = console.log
		}
		return await db.seq.query(this.make(), {
			...opts,
			replacements: params,
		})
	}
}

module.exports = RawQueryBuilder
