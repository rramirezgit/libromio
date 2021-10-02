const AwaitEventEmitter = require('await-event-emitter').default
const emitter = new AwaitEventEmitter()

const _oldEmit = emitter.emit.bind(emitter)
const _oldOn = emitter.on.bind(emitter)

emitter.emit = async function(type, ...args) {
	if (args[0] && args.length == 1 && typeof args[0] == 'object') {
		if (args[0].managedEvent) {
			args[0].managedEvent.addEmittedEvent(type, args[0])
		}
	}
	return await _oldEmit(type, ...args)
}

emitter.on = function(runEvenIfManagedEvent, type, fn) {
	if (typeof runEvenIfManagedEvent === 'string') {
		fn = type
		type = runEvenIfManagedEvent
		runEvenIfManagedEvent = true
	}
	return _oldOn(type, async (...args) => {
		if (!runEvenIfManagedEvent && args[0] && typeof args[0] == 'object') {
			if (args[0].managedEvent) return
		}
		await fn(...args)
	})
}

emitter.managedEvent = (name) => {
	let _emitListeners = []
	let _cancelListeners = []
	let _canceled = false
	let _emitted = false
	let _data = {}
	let _emittedEvents = []
	const managedEvent = Object.freeze({
		name,
		onEmit: async (fn) => {
			if (_emitted) await fn(_data)
			else _emitListeners.push(fn)
		},
		onCancel: async (fn) => {
			if (_canceled) await fn()
			else _cancelListeners.push(fn)
		},
		data: (data = {}) => {
			Object.assign(_data, data)
			return managedEvent
		},
		emit: async (data = {}) => {
			if (_emitted || _canceled) return
			Object.assign(_data, data)
			_emitted = true

			for (fn of _emitListeners) {
				if (_canceled) return
				await fn(_data)
			}
			if (_canceled) return
			await emitter.emit(name, _data, managedEvent)
		},
		cancel: async () => {
			_canceled = true
			for (fn of _cancelListeners) await fn()
		},
		try: async (fn) => {
			try {
				await fn()
			} catch (err) {
				await managedEvent.cancel()
				throw err
			}
		},
		addEmittedEvent: (type, data) => {
			_emittedEvents.push({ type, data })
		},
		wasEventEmitted: (type, data) => {
			let events = _emittedEvents.filter((e) => e.type == type)
			if (data) {
				events = events.filter((e) => {
					for (let k in data) {
						if (data[k] !== e.data[k]) return false
					}
					return true
				})
			}
			return events.length > 0
		},
	})
	return managedEvent
}

module.exports = emitter
