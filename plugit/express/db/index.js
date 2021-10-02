const { join } = require('path')
const glob = require('glob')
const Sequelize = require('sequelize')
const cls = require('cls-hooked')
const { snakeCase, pascalCase, camelCase } = require('case-anything')
const { Model, DataTypes } = require('sequelize')
const CustomTypes = require('./custom-types')
const Serializer = require('sequelize-to-json')
const QueryBuilder = require('./query-builder')
const RawQueryBuilder = require('./raw-query-builder')
const {
	fileUploader,
	emitter,
	v: { validateAll },
} = require('#/utils')

const uploadFile = fileUploader()
const db = {}
const ModelClasses = []
const env = process.env.NODE_ENV || 'development'
const { database, username, password, ...config } = require('../../../database/config')[env]

const namespace = cls.createNamespace('drubbit')
Sequelize.useCLS(namespace)
db.sequelize = new Sequelize(database, username, password, config)
db.namespace = namespace
db.seq = db.sequelize
db.models = {}

for (let fnkey of ['fn', 'where', 'literal', 'col', 'escape']) {
	db[`$${fnkey}`] = (...args) => db.sequelize[fnkey](...args)
}

db._ = (...args) => db.sequelize.literal(...args)
db.$queryBuilder = () => new QueryBuilder(db)
db.$rawQueryBuilder = (type) => new RawQueryBuilder(db, type)
db.$transaction = async (fn) => {
	let transaction = db.namespace.get('transaction')
	try {
		if (transaction) return await fn(transaction)
		else return await db.seq.transaction(fn)
	} catch (err) {
		if (err) throw err
	}
}

//READ MODELS
let files = glob.sync('plugit/**/models/*.js')

for (let file of files) {
	if (file.endsWith('extension.js')) continue

	//Require model file
	let modelConstructorFn = require(join(__dirname, '../../..', file))
	let ModelClass = modelConstructorFn(Model, DataTypes, CustomTypes)
	let modelName = pascalCase(ModelClass.name)
	let tableName = modelName

	let extensionFiles = glob.sync(`plugit/**/models/${modelName}.extension.js`)
	for (let extensionFile of extensionFiles) {
		let extensionModelConstructorFn = require(join(__dirname, '../../..', extensionFile))
		ModelClass = extensionModelConstructorFn(ModelClass, DataTypes, CustomTypes)
	}

	//Props: Defaults and Filters
	let props = {
		id: CustomTypes.ID(),
		...(ModelClass.$props() || {}),
	}

	for (let [key, data] of Object.entries(props)) {
		if (data.allowNull === undefined) data.allowNull = false

		if (data._filters) {
			data.set = function(value) {
				data._filters.forEach((filter) => {
					if (value) value = filter(value)
				})
				this.setDataValue(key, value)
			}
		}
	}

	// Files Virtual Props
	let fileFns = getAllPropertyNames(ModelClass).filter(
		(prop) => prop.startsWith('$fileUpload_') && typeof ModelClass[prop] === 'function'
	)

	let fileKeys = fileFns.map((fnName) => fnName.substr(12))
	for (let fileKey of fileKeys) {
		props[fileKey] = props[fileKey] || { type: DataTypes.VIRTUAL }
	}

	ModelClass.prototype.uploadFile = async function(fileKey) {
		let fileObj = this.getDataValue(fileKey)
		if (!fileObj) return
		let uploadOptions = ModelClass[`$fileUpload_${fileKey}`](this, db)
		let result = await uploadFile(fileObj, uploadOptions)
		if (!result) throw new Error('File upload failed')
	}

	// Default Config
	let config = (ModelClass.$config && ModelClass.$config()) || {}
	if (config.timestamps === undefined) config.timestamps = false

	//Config scopes
	let allScopes = {}
	if (ModelClass.$scopes) {
		allScopes = ModelClass.$scopes(db.$queryBuilder)
	}
	let scopesFns = getAllPropertyNames(ModelClass).filter(
		(prop) => prop.startsWith('$scope_') && typeof ModelClass[prop] === 'function'
	)

	for (let fnName of scopesFns) {
		allScopes[fnName.substr(7)] = ModelClass[fnName](db.$queryBuilder)
	}

	for (let k in allScopes) {
		if (allScopes[k].constructor.name == 'QueryBuilder') {
			allScopes[k] = allScopes[k].get()
		}
	}
	ModelClass.$buildFromScope = function(name, values = {}) {
		return ModelClass.build(values, {
			include: allScopes[name].include,
		})
	}

	config.scopes = { ...(config.scopes || {}), ...allScopes }
	config.defaultScope = allScopes.default || config.defaultScope

	//Init
	ModelClass.init(props, {
		...config,
		sequelize: db.sequelize,
		modelName,
		tableName,
		underscored: false,
	})

	db[ModelClass.name] = ModelClass
	db.models[ModelClass.name] = ModelClass
	ModelClasses.push(ModelClass)
}

//Rules and Validation
ModelClasses.forEach((ModelClass) => {
	ModelClass.prototype.getRules = function(...onlyRules) {
		if (!ModelClass.$rules) return null
		let rulesOptions = {}
		if (onlyRules.length && typeof onlyRules[onlyRules.length - 1] == 'object') {
			rulesOptions = onlyRules.pop()
		}
		let allRules = ModelClass.$rules(this, db, rulesOptions)
		if (onlyRules.length) {
			let rules = {}
			for (let key of onlyRules) {
				if (allRules[key]) rules[key] = allRules[key]
			}
			return rules
		} else {
			return allRules
		}
	}

	ModelClass.prototype.validateRules = async function(...onlyRules) {
		let rules = this.getRules(...onlyRules)
		if (!rules) return true
		return await validateAll(this, rules)
	}

	ModelClass.prototype.setAndValidate = async function(data = {}, options = {}) {
		this.set(data)
		let { extraRules, ...rulesOptions } = options
		let rules = Object.keys(data).concat(extraRules || [])
		rules.push(rulesOptions)
		return await this.validateRules(...rules)
	}
})

//Serializer Extension
let parseScheme = (scheme) => {
	let out = { include: [], exclude: [], assoc: {} }
	if (Array.isArray(scheme)) {
		for (let key of scheme) {
			if (key.includes('@') && !key.startsWith('@')) {
				let [assocKey, assocScheme] = key.split('@')
				out.assoc[assocKey] = assocScheme
				out.include.push(assocKey)
			} else if (key.startsWith('-') || key.startsWith('!')) {
				out.exclude.push(key.substr(1))
			} else {
				out.include.push(key)
			}
		}
	} else {
		out = scheme
	}
	//out.include = out.include || []
	//out.exclude = out.exclude || []

	/*if (!out.include.includes('@fk') && !out.exclude.includes('@fk')) {
		out.exclude.push('@fk')
	}*/
	return out
}

ModelClasses.forEach((ModelClass) => {
	const schemesFns = getAllPropertyNames(ModelClass).filter(
		(prop) => prop.startsWith('$scheme_') && typeof ModelClass[prop] === 'function'
	)
	const schemes = {}
	for (let fn of schemesFns) {
		let name = fn.substr(8)
		schemes[name] = parseScheme(ModelClass[fn]())
	}

	schemes.default = schemes.default || {
		include: ['@all', '@assoc'],
		//exclude: ['@fk'],
	}

	ModelClass.serializer = {
		schemes,
		defaultScheme: 'default',
	}

	ModelClass.$scheme = function(name) {
		return (name && schemes[name]) || schemes.default
	}

	ModelClass.serializeAll = function(data, scheme, options) {
		return Serializer.serializeMany(data, ModelClass, scheme, options)
	}

	ModelClass.findAndSerializeAll = async function(options = {}) {
		let { scheme, ...findOptions } = options
		let data = await this.findAll(findOptions)
		return Serializer.serializeMany(data, ModelClass, scheme)
	}

	ModelClass.prototype.serialize = function(scheme, options) {
		return new Serializer(ModelClass, scheme, options).serialize(this)
	}

	ModelClass.prototype.toJSON = function() {
		return this.serialize()
	}
})

//Joins / Associations
ModelClasses.forEach((ModelClass) => {
	if (!ModelClass.$joins) return

	let funcs = {}
	let joinTypes = ['belongsTo', 'hasOne', 'hasMany', 'belongsToMany']
	joinTypes.forEach((joinType) => {
		funcs[joinType] = (as, RefModelClass, config = {}) => {
			if (config.constraints !== false) {
				if (config.onUpdate === undefined) config.onUpdate = 'RESTRICT'
				if (config.onDelete === undefined) config.onDelete = 'RESTRICT'
			}
			if (config.foreignKey === undefined) config.foreignKey = {}
			if (typeof config.foreignKey === 'string') {
				config.foreignKey = { name: config.foreignKey }
			}
			/*if (config.allowNull !== undefined) {
				config.foreignKey.allowNull = config.allowNull
			}
			if (config.foreignKey.allowNull === undefined) {
				config.foreignKey.allowNull = false
			}*/
			if (!config.foreignKey.name) {
				switch (joinType) {
					case 'hasOne':
					case 'hasMany':
					case 'belongsToMany':
						config.foreignKey.name = camelCase(`${ModelClass.name}Id`)
						break
					case 'belongsTo':
						config.foreignKey.name = camelCase(`${RefModelClass.name}Id`)
						break
				}
			}
			if (joinType == 'belongsToMany') {
				if (config.otherKey === undefined) config.otherKey = {}
				if (typeof config.otherKey === 'string') {
					config.otherKey = { name: config.otherKey }
				}
				/*if (config.allowNull !== undefined) {
					config.otherKey.allowNull = config.allowNull
				}
				if (config.otherKey.allowNull === undefined) {
					config.otherKey.allowNull = false
				}*/
				if (!config.otherKey.name) {
					config.otherKey.name = camelCase(`${RefModelClass.name}Id`)
				}
			}
			//if (config.required === undefined) config.required = true
			config.as = as
			ModelClass[joinType](RefModelClass, config)
		}
	})

	ModelClass.$joins(db, funcs)
})

//Emitter Hooks
/*ModelClasses.forEach((ModelClass) => {
	let _emitAll = async (names, instance, action) => {
		for (let name of names) {
			await emitter.emit(`${ModelClass.name}:${name}`, instance, action)
		}
	}
	let _emitEvent = async (action, instance) => {
		let transaction = db.namespace.get('transaction')
		if (transaction) {
			await _emitAll([`${action}:beforeCommit`, 'changed:beforeCommit'], instance, action)
			transaction.afterCommit(async () => {
				await _emitAll([action, 'changed'], instance, action)
			})
		} else {
			await _emitAll(
				[`${action}:beforeCommit`, 'changed:beforeCommit', action, 'changed'],
				instance,
				action
			)
		}
	}
	ModelClass.afterSave(async (instance, options) => {
		await _emitEvent('saved', instance)
	})
	ModelClass.afterDestroy(async (instance, options) => {
		await _emitEvent('destroyed', instance)
	})
})*/

//On init
ModelClasses.forEach((ModelClass) => {
	ModelClass.$init && ModelClass.$init(db)
})

//Helper
function getAllPropertyNames(obj) {
	var props = []

	do {
		Object.getOwnPropertyNames(obj).forEach(function(prop) {
			if (props.indexOf(prop) === -1) {
				props.push(prop)
			}
		})
	} while ((obj = Object.getPrototypeOf(obj)))

	return props
}

module.exports = db
