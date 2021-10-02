const { cloneDeep, merge } = require('lodash')
const { Op } = require('sequelize')

function QueryBuilder(db) {
	let _o = {}
	let _include = {}
	let _onlyExplicitAttrs = false

	let _parseConditions = (arr) => {
		return arr.map((condition) => {
			if (Array.isArray(condition)) {
				if (typeof condition[0] == 'string') {
					condition[0] = db.$col(condition[0])
				}
				return db.$where(...condition)
			}
			return condition
		})
	}

	let _defineAssoc = (assoc, hasThrough) => {
		let parts = assoc.split('.')
		for (let [i, part] of parts.entries()) {
			let assoc = parts.slice(0, i + 1).join('.')
			if (!_include[assoc]) {
				_include[assoc] = {}
				if (_onlyExplicitAttrs) {
					_include[assoc].attributes = []
				}
			}

			if (i == parts.length - 1 && hasThrough && !_include[assoc].through) {
				_include[assoc].through = {}
				if (_onlyExplicitAttrs) {
					_include[assoc].through.attributes = []
				}
			}
		}
	}

	this.where = (...conditions) => {
		_o.where = _o.where || []
		_o.where = _o.where.concat(_parseConditions(conditions))
		return this
	}

	this.whereAny = (...conditions) => {
		return this.where({
			[Op.or]: _parseConditions(conditions),
		})
	}

	this.having = (...conditions) => {
		_o.having = _o.having || []
		_o.having = _o.having.concat(_parseConditions(conditions))
		return this
	}

	this.havingAny = (...conditions) => {
		return this.having({
			[Op.or]: _parseConditions(conditions),
		})
	}

	this.join = (assoc, doMerge, opts) => {
		let hasThrough = assoc.startsWith('#')
		if (hasThrough) assoc = assoc.substr(1)

		if (typeof doMerge == 'object') {
			opts = doMerge
			doMerge = false
		}

		_defineAssoc(assoc, hasThrough)

		if (doMerge) {
			merge(_include[assoc], opts)
		} else {
			Object.assign(_include[assoc], opts)
		}
		return this
	}

	this.joinWhere = (assoc, any) => {
		let hasThrough = assoc.startsWith('#')
		if (hasThrough) assoc = assoc.substr(1)

		_defineAssoc(assoc, hasThrough)

		let obj = _include[assoc]
		if (hasThrough) obj = obj.through
		obj.where = obj.where || []
		obj.where.push(any)
		return this
	}

	this.onlyExplicitAttrs = () => {
		_onlyExplicitAttrs = true
		_o.attributes = []
		return this
	}

	this.emptyAttrs = () => {
		_o.attributes = []
		for (let assoc in _include) {
			_include[assoc].attributes = []
			if (_include[assoc].through) {
				_include[assoc].through.attributes = []
			}
		}
		return this
	}

	this.order = (col, asc = 'ASC') => {
		_o.order = _o.order || []
		if (typeof asc == 'boolean') {
			asc = asc ? 'ASC' : 'DESC'
		}
		if (typeof col == 'string' && col.includes('.')) {
			col = db.$col(col)
		}
		_o.order.push([col, asc])
		return this
	}

	this.group = (col) => {
		_o.group = _o.group || []
		if (typeof col == 'string' && col.includes('.')) {
			col = db.$col(col)
		}
		_o.group.push(col)
		return this
	}

	this.set = (doMerge, opts) => {
		if (typeof doMerge == 'object') {
			opts = doMerge
			doMerge = false
		}
		if (doMerge) {
			merge(_o, opts)
		} else {
			Object.assign(_o, opts)
		}
		return this
	}

	this.clone = (opts) => {
		let builder = new QueryBuilder(db)
		builder.set(cloneDeep(_o))
		for (let assoc in _include) {
			builder.join(assoc, cloneDeep(_include[assoc]))
		}
		if (opts) builder.set(opts)
		return builder
	}

	this.get = (opts) => {
		let output = cloneDeep(_o)
		if (opts) {
			delete opts.include
			delete opts.where
			Object.assign(output, opts)
		}
		_generateInclude(output)
		if (output.logging && process.env.NODE_ENV != 'production') {
			output.logging = console.log
			console.log('Builder\n')
			console.dir(output, { depth: null })
		}
		return output
	}

	let _generateInclude = (output) => {
		for (let [dotAssoc, opts] of Object.entries(_include)) {
			let obj = output
			for (let association of dotAssoc.split('.')) {
				obj.include = obj.include || []
				let assocObj = obj.include.find((assocObj) => assocObj.association == association)
				if (!assocObj) {
					assocObj = { association }
					obj.include.push(assocObj)
				}
				obj = assocObj
			}
			Object.assign(obj, cloneDeep(opts))
		}
	}

	this.debug = () => {
		_o.logging = true
		return this
	}
}

module.exports = QueryBuilder
