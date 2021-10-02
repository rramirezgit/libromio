const moment = require('moment')
const freeze = require('deep-freeze-node')
const { pick, before } = require('lodash')
const dottie = require('dottie')
const { db } = require('#/express')
const {
	Cache,
	emitter,
	ApiRes,
	fileUploader,
	v,
	logger: { debug },
} = require('#/utils')

const _defs = {}
const _defsExtra = {}
const _customFields = {}
const _watchers = {}

class ConfigService {
	static async getAll(keyname) {
		return await Cache.get('allConfigs', keyname)
	}

	static async getActive(keyname) {
		let configs = await this.getAll(keyname)
		let def = _defs[keyname] || {}
		let actives = def.program ? configs.filter((c) => c.active) : configs
		return def.multiple ? actives : actives[0]
	}

	static async _getActiveData(keyname, args) {
		let def = _defs[keyname] || {}
		let activeConfig = await this.getActive(keyname)
		let data = def.multiple ? activeConfig.map((config) => config.data) : activeConfig && activeConfig.data
		if (!data) return null
		let getter = _defsExtra[keyname].activeDataGetter
		return getter ? await getter(data, activeConfig, ...args) : data
	}

	static async getActiveData(keyname, ...args) {
		if (Array.isArray(keyname)) {
			let data = await Promise.all(
				keyname.map(async (_keyname) => [_keyname, await this._getActiveData(_keyname, args)])
			)
			data = data.reduce((obj, [_keyname, data]) => {
				obj[_keyname] = data
				return obj
			}, {})
			return data
		} else {
			return await this._getActiveData(keyname, args)
		}
	}

	static getDefinition(keyname) {
		return _defs[keyname]
	}

	static getAllDefinitions() {
		return { ..._defs }
	}

	/**
	 * @param {string} keyname
	 * @param {Object} def
	 * @param {string} def.name
	 * @param {boolean} def.multiple
	 * @param {boolean} def.program
	 * @param {Object<string, {
	 *  type: ('number'|'string'|'date'|'datetime'|'time'|'file'),
	 *  customType: string,
	 *  fileKey?: string,
	 *  label: string,
	 *  defaultValue: any,
	 *  columns: number,
	 *  componentName: string,
	 *  componentAttrs: {},
	 *  watch: (newVal: any, oldVal: any) => void,
	 * }>} def.fields
	 * @param {(data: {}, instance: {}) => void} def.dataSetter - //data.name = data.name.toLowerCase()
	 * @param {(instance: {}, isNew: boolean, apiRes: {}) => void} def.beforeSave - //void
	 * @param {(data: ({}|Array), instance: ({}|Array)) => ({}|Array)} def.activeDataGetter - //return data.sort(..)
	 * @param {(data: {}, isNew: boolean) => {}} def.dataRules - //return {[fieldKey]: [...validatorsFns]}
	 * @param {(data: {}, isNew: boolean) => {}} def.filesRules - //return {[fileKey]: [...validatorsFns]}
	 * @param {(instance: {}) => {filename: any,dest: any, done: any}} def.filesUpload - //return {[fieldKey]: [...validatorsFns]}
	 * @param {{}} def.events - //{[eventKey]: async (instance, ...eventArgs) => {}}
	 * @param {{}} def.hooksEvents - //{[hookEventName]: async (instance) => {},}
	 * @param {(instance: {}) => Array<{type: ('text'|'image'), wider: boolean, value: string}>} def.reference - //{[hookEventName]: async (instance) => {},}
	 * @param {(instance: {}) => any} def.referenceKey - //{[hookEventName]: async (instance) => {},}
	 */
	static define(keyname, def) {
		def.keyname = keyname
		if (!Array.isArray(def.fields)) {
			def.fields = Object.entries(def.fields).map(([key, field]) => ({
				...field,
				key,
			}))
		}
		for (let field of def.fields) {
			let custom = _customFields[field.customType]
			if (custom) {
				if (custom.field.componentAttrs) {
					field.componentAttrs = {
						...custom.field.componentAttrs,
						...(field.componentAttrs || {}),
					}
				}
				Object.assign(field, { ...custom.field, ...field })
				if (custom.defMixin) {
					let mixin = custom.defMixin(field)
					if (mixin.events) {
						def.events = { ...mixin.events, ...(def.events || {}) }
					}
					if (mixin.hooksEvents) {
						def.hooksEvents = {
							...mixin.hooksEvents,
							...(def.hooksEvents || {}),
						}
					}
				}
			}
			if (field.watch) {
				_watchers[keyname] = _watchers[keyname] || {}
				_watchers[keyname][field.key] = field.watch
				delete field.watch
			}
		}
		if (def.events) {
			for (let [eventKey, listener] of Object.entries(def.events)) {
				emitter.on(eventKey, async (...args) => {
					for (let instance of await this.getAll(keyname)) {
						await listener(instance, ...args)
					}
				})
			}
			delete def.events
		}
		if (def.hooksEvents) {
			for (let [hookEventName, listener] of Object.entries(def.hooksEvents)) {
				emitter.on(hookEventName, async (instance, ...args) => {
					if (instance.keyname == keyname) {
						await listener(instance, ...args)
					}
				})
			}
			delete def.hooksEvents
		}
		let extras = ['dataRules', 'filesRules', 'filesUpload', 'dataSetter', 'activeDataGetter', 'beforeSave']
		_defsExtra[keyname] = {}
		for (let extra of extras) {
			if (def[extra]) {
				_defsExtra[keyname][extra] = def[extra]
				delete def[extra]
			}
		}
		_defs[keyname] = freeze(def)
	}

	static defineCustomFieldType(
		type,
		/*{
			...same as define function's field props
		}*/
		field = {},
		/* (field) => ({
			events,
			hooksEvents,		
		})*/
		defMixin
	) {
		_customFields[type] = {
			field,
			defMixin,
		}
	}

	static async save(
		/*{
			id?: Numnber,
			keyname: String,
			fromDate: String,
			toDate?: String,
			data: Object,
			updatedBy: String
		}*/
		data = {},
		files = {}
	) {
		let isNew = !data.id
		let apiRes = ApiRes()
		let def = _defs[data.keyname]
		if (!def) {
			return apiRes.error('El nombre clave es inválido o no tiene una configuración definida.')
		}
		if (isNew && !(await this._canCreateConfig(data.keyname))) {
			return apiRes.error('No se puede crear una nueva configuración')
		}

		//debug(data)
		//debug(files)

		await db.$transaction(async (t) => {
			let config
			if (isNew) {
				config = db.Config.build()
			} else {
				config = await db.Config.findOne({
					where: { id: data.id, keyname: data.keyname },
					lock: true,
				})
				if (!config) {
					apiRes.error('La configuración es inexistente o ha sido eliminada')
					throw null
				}
			}

			const prevData = { ...(config.data || {}) }
			config.set({
				keyname: data.keyname,
				fromDate: def.program ? data.fromDate : null,
				toDate: def.program && def.multiple ? data.toDate : null,
				updatedBy: data.updatedBy,
			})

			let results = await v.validateAll(config, {
				fromDate: def.program ? [v.required()] : null,
				toDate: [
					v.ifNotEmpty(),
					(value) =>
						!config.fromDate ||
						moment(value).isSameOrAfter(config.fromDate, 'day') ||
						'Debe ser igual o mayor a la fecha de inicio',
				],
			})

			apiRes.validation(results, 'config')

			let fieldsKeys = def.fields.map(({ key }) => key)
			let configData = pick(data.data || {}, fieldsKeys)
			let { dataSetter } = _defsExtra[config.keyname]
			if (dataSetter) await dataSetter(configData, config)
			config.data = configData

			let { dataRules } = _defsExtra[config.keyname]
			if (dataRules) {
				let rules = dataRules(config, isNew)
				let results = await v.validateAll(config.data, rules)
				apiRes.validation(results, 'config.data')
			}

			let { filesRules } = _defsExtra[config.keyname]
			if (filesRules) {
				let rules = filesRules(config, isNew)
				let results = await v.validateAll(files, rules)
				apiRes.validation(results, 'config.files')
			}

			let { beforeSave } = _defsExtra[config.keyname]
			if (beforeSave) await beforeSave(config, isNew, apiRes)

			if (apiRes.hasErrors()) throw null

			let { filesUpload } = _defsExtra[config.keyname]
			if (filesUpload) {
				let filesUploadConfig = filesUpload(config)
				let uploadFile = fileUploader(files)
				for (let [fileKey, fileUploadConfig] of Object.entries(filesUploadConfig)) {
					await uploadFile(fileKey, fileUploadConfig)
				}
			}

			await config.save()
			Cache.delete('allConfigs', config.keyname)
			apiRes.data({ configId: config.id })

			let subEvent = isNew ? 'CREATE' : 'UPDATE'
			await emitter.emit('Config.SAVE', { id: config.id, subEvent, t })
			t.afterCommit(async () => {
				await this._runWatchers(config, config.data, prevData)
			})
		})
		return apiRes
	}

	static async delete(id) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let config = await db.Config.findByPk(id)
			if (!config) return
			if (!this._canDeleteConfig(config.keyname)) {
				apiRes.error('La configuración no puede ser eliminada.')
				throw null
			}
			const prevData = { ...(config.data || {}) }
			await config.destroy()
			Cache.delete('allConfigs', config.keyname)
			t.afterCommit(async () => {
				await this._runWatchers(config, {}, prevData)
			})
		})
		return apiRes
	}

	static _canDeleteConfig(keyname) {
		let def = this.getDefinition(keyname)
		if (!def) return true
		if (!def.multiple && !def.program) {
			return false
		}
		return true
	}

	static async _canCreateConfig(keyname) {
		let def = this.getDefinition(keyname)
		if (!def) return false
		if (!def.multiple && !def.program) {
			let active = await this.getActive(keyname)
			return !active
		}
		return true
	}

	static async _setupDynamicComponentsAttrs(def, configs) {
		for (let field of def.fields) {
			if (!field.componentAttrs) continue
			for (let [attrKey, attrVal] of Object.entries(field.componentAttrs)) {
				if (typeof attrVal != 'function') continue
				for (let config of configs) {
					let val = await attrVal(config, field)
					if (val === undefined) val = null
					dottie.set(config, `componentAttrs.${field.key}.${attrKey}`, val)
				}
			}
		}
	}

	static async _setupDynamicReferences(def, configs) {
		for (let config of configs) {
			if (def.reference) {
				config.reference = await def.reference(config)
			}
			if (def.referenceKey) {
				config.referenceKey = await def.referenceKey(config)
			}
		}
	}

	static async _runWatchers(instance, newData, prevData) {
		let { keyname } = instance
		if (!_watchers[keyname]) return
		for (let [fieldKey, watcher] of Object.entries(_watchers[keyname])) {
			let newValue = newData[fieldKey]
			let oldValue = prevData[fieldKey]
			if (newValue != oldValue) {
				await watcher(newValue, oldValue, instance)
			}
		}
	}

	static _sortConfigs(def, configs) {
		if (!def.program) return
		if (def.multiple) {
			this.__sortMultipleConfigs(configs)
		} else {
			this.__sortSingleConfigs(configs)
		}
	}

	static __sortMultipleConfigs(configs) {
		let today = moment()
		configs.forEach((c) => {
			if (today.isBefore(c.fromDate, 'day')) {
				c.status = 'future'
			} else if (c.toDate && today.isAfter(c.toDate, 'day')) {
				c.status = 'past'
			} else {
				c.status = 'present'
			}
		})
		configs.sort((a, b) => {
			if (a.status != b.status) {
				if (a.status == 'future' || b.status == 'past') return 1
				else return -1
			}

			if (!a.toDate && !b.toDate) {
				return moment(a.fromDate).diff(b.fromDate, 'days')
			}
			if (a.toDate && b.toDate) {
				return moment(a.toDate).diff(b.toDate, 'days') || moment(a.fromDate).diff(b.fromDate, 'days')
			}
			return a.toDate ? -1 : 1
		})
		configs.forEach((c) => (c.active = c.status == 'present'))
	}

	static __sortSingleConfigs(configs) {
		configs.sort((a, b) => {
			return moment(b.fromDate).diff(a.fromDate, 'days')
		})

		let activeFound = false
		let today = moment()
		for (let config of configs) {
			if (today.isBefore(config.fromDate, 'day')) {
				config.active = false
				config.status = 'future'
			} else if (!activeFound) {
				activeFound = true
				config.active = true
				config.status = 'present'
			} else {
				config.active = false
				config.status = 'past'
			}
		}
		configs.reverse()
	}
}

Cache.preset('allConfigs', {
	data: async (keyname) => {
		let def = _defs[keyname]
		if (!def) return []
		let configs = await db.Config.findAll({ where: { keyname } })
		await ConfigService._setupDynamicComponentsAttrs(def, configs)
		await ConfigService._setupDynamicReferences(def, configs)
		ConfigService._sortConfigs(def, configs)
		return configs
	},
	key: (keyname) => keyname,
	duration: '1 day',
})

module.exports = ConfigService
