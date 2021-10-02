const _ = require('lodash')

class Flow {
	static _statuses = {}
	static define(statuses) {
		for (let [key, status] of Object.entries(statuses)) {
			status.key = key
		}
		Object.assign(this._statuses, statuses)
	}

	static get(key, prop = null) {
		let status = this._statuses[key]
		if (!status) return null
		return prop ? status[prop] : { ...status }
	}

	get(key, prop = null) {
		return this.constructor.get(key, prop)
	}

	current(prop = null) {
		return this.get(this._getCurrentKey(), prop)
	}

	is(...statusKey) {
		return statusKey.includes(this.current('key'))
	}

	isInitial() {
		return this.current('initial') || this.is('pending')
	}

	async assign(statusKey, opts = {}) {
		if (!opts.data) {
			opts.data = {}
		}

		let status = this.get(statusKey)
		if (!status) return false

		let isAssignable = await this.isStatusAssignable(statusKey, opts)
		if (!isAssignable) return false

		if (status.beforeAssign) {
			await status.beforeAssign.call(this, opts)
		}

		await this._assign(status, opts)
		if (status.afterAssign) {
			await status.afterAssign.call(this, opts)
		}
		await this._afterAssign(status, opts)
		return true
	}

	getStatuses() {
		return _.cloneDeep(this.constructor._statuses)
	}

	async isStatusAssignable(statusKey, opts = {}) {
		let status = this.get(statusKey)
		let { flowsTo = true, key: currentKey } = this.current()
		if (currentKey == statusKey) {
			return false
		}

		if (opts.manualMode == true) {
			if (status.manual === false) {
				return false
			}
		}

		if (flowsTo === false) {
			return false
		} else if (Array.isArray(flowsTo)) {
			if (!flowsTo.includes(statusKey)) {
				return false
			}
		} else if (typeof flowsTo == 'function') {
			if (!(await flowsTo.call(this, status))) {
				return false
			}
		}

		let canAssign = await this._canAssign(status, opts)
		if (canAssign && status.canAssign) {
			canAssign = await status.canAssign.call(this, opts)
		}
		if (!canAssign) {
			return false
		}

		return true
	}

	async getAllAssignableStatuses(opts = {}) {
		let statuses = this.getStatuses()

		for (let [statusKey, status] of Object.entries(statuses)) {
			status.current = this.is(statusKey)
			status.assignable = await this.isStatusAssignable(statusKey, opts)
		}

		return statuses
	}

	// FOR EXTEND ----------------------------------------------------
	_getCurrentKey() {
		return null
	}

	async _canAssign(status, data) {
		return true
	}

	async _assign(status, data) {
		return null
	}

	async _afterAssign(status, data) {
		return null
	}
}

module.exports = Flow
