import axios from 'axios'
import deepMerge from 'deepmerge'

const _mainHandlers = {
	beforeCall: async ({ options }) => {
		if (options.cache) {
			let response = options._api.getCache(options.url, options.query)
			if (response) {
				return await _mainHandlers.done({
					response,
					options,
					applyCache: false,
				})
			}
		}

		if (options.onValidation) {
			options.onValidation({ validation: {}, options })
		}

		let showLoader = () => {
			if (options.loader !== false && options.loading) {
				options.loading(true, options.loaderTitle, options.loaderText)
			}
		}

		if (options.confirm && options.onConfirm) {
			return new Promise((resolve) => {
				let confirmed = () => {
					showLoader()
					resolve(true)
				}
				let canceled = () => resolve({ confirmed: false })
				options.onConfirm({ options, confirmed, canceled })
			})
		} else {
			showLoader()
		}
		return true
	},
	afterCall: async ({ options }) => {
		if (options.loader !== false && options.loading) {
			options.loading(false)
		}
	},
	done: async ({ response, options, applyCache }) => {
		let { success, data, redirect, validation, message } = response.data
		let _aborted = false
		options.abort = () => (_aborted = true)

		if (redirect) {
			window.location = redirect
			return new Promise(() => {})
		}

		if (success && applyCache !== false) {
			if (options.cache) {
				options._api.setCache(options.url, options.query, response)
			}
			if (options.clearCache) {
				options._api.clearCache(options.clearCache)
			}
		}

		if (validation && options.onValidation) {
			options.onValidation({ validation, options })
			if (_aborted) return
		}

		if (options.onMessage) {
			if (message) {
				options.onMessage({ message, options })
			} else if (success && options.successMessage) {
				if (typeof options.successMessage == 'function') {
					message = await options.successMessage({ data, response, options })
				} else {
					message = { ...options.successMessage }
				}
				message.type = 'success'
				options.onMessage({ message, options })
			}
			if (_aborted) return
		}

		if (success && options.onSuccess) {
			await options.onSuccess({
				data,
				validation,
				message,
				response,
				options,
			})
			if (_aborted) return
		}

		if (options.done) {
			await options.done({
				success,
				data,
				validation,
				message,
				response,
				options,
			})
			if (_aborted) return
		}

		await _mainHandlers.afterCall({ options })
		return { success, data, validation, message, confirmed: true }
	},
	fail: async ({ response, options }) => {
		let { message } = response.data

		if (message && options.onMessage) {
			options.onMessage({ message, options })
		}
		if (options.fail) {
			await options.fail({ response, options })
		}
		await _mainHandlers.afterCall({ options })
	},
}

async function _call(
	instance,
	method,
	url,
	callOptions = {} /*
	{
		url: '/path',
		baseUrl: '/path',
		query: {page: 1},
		data: {var: '', obj: {}, arr: [], ...},
		files: {fileKey: file or files, ...}
		done: ({success, data, message, validation, confirmed, options}) => {},
		onSuccess: ({data, message, validation, confirmed, options}) => {},
		fail: ({response, options}) => {},
		onValidationCleanup: ({options}) => {},
		onValidation: ({validation: , options}) => {},
		onMessage: ({message: {type, title, text, description, code}, options}) => {},
		onConfirm: ({confirmed, canceled, options}) => {},
		successMessage: { title, text },
		axios: {headers: {}, ...},
		form: null,
		loader: false,
		loading: (visible, title, text) => {},
		loaderTitle: null,
		loaderText: null,
		confirm: { title, text, accept, cancel },
		cache: false,
		clearCache: '' / ['']
	}*/
) {
	if (typeof url == 'object') callOptions = url
	else callOptions.url = url

	let options = deepMerge(instance.defaults(), callOptions)
	options.files = callOptions.files
	options.cache = method == 'get' && options.cache === true
	options._api = instance

	let result = await _mainHandlers.beforeCall({ options })
	if (result !== true) return result

	let axiosOptions = deepMerge(
		{
			method,
			url: `${options.baseUrl || ''}${options.url}`,
			params: options.query,
			headers: {
				'Content-Type': 'multipart/form-data',
				'X-Requested-With': 'XMLHttpRequest',
			},
		},
		options.axios || {}
	)

	if ((options.data || options.files) && method != 'get') {
		axiosOptions.data = _getFormData(options.data, options.files)
	}

	let response
	try {
		response = await axios(axiosOptions)
	} catch (err) {
		if (!err.isAxiosError) throw err
		response = err.response
	}
	return await _mainHandlers.done({ response, options })
}

function _getFormData(postData, postFiles) {
	let formData = new FormData()
	formData.append('data_json', JSON.stringify(postData || {}))
	postFiles = postFiles || {}
	for (let x in postFiles) {
		if (postFiles[x]) {
			if (Array.isArray(postFiles[x])) {
				for (let postFile of postFiles[x]) {
					formData.append(x + '[]', postFile)
				}
			} else {
				formData.append(x, postFiles[x])
			}
		}
	}
	//console.log(formData, postFiles)
	return formData
}

function Api(defaults) {
	let instanceDefaults = { ...(defaults || {}) }
	let cache = []

	this.defaults = (defaults) => {
		if (defaults === undefined) {
			return instanceDefaults
		} else {
			instanceDefaults = { ...instanceDefaults, ...(defaults || {}) }
		}
	}

	this.clone = (defaults) => {
		return new Api({
			...instanceDefaults,
			...(defaults || {}),
		})
	}

	let _findCacheItemIndex = (url, query) => {
		return cache.findIndex((item) => {
			if (item.url != url) return false
			if (query !== false) {
				let q1 = item.query || {},
					q2 = query || {}
				for (let key in q1) {
					if (q1[key] != q2[key]) return false
				}
				for (let key in q2) {
					if (q1[key] != q2[key]) return false
				}
			}
			return true
		})
	}

	let _findCacheItem = (url, query) => {
		let index = _findCacheItemIndex(url, query)
		return index >= 0 ? cache[index] : null
	}

	this.getCache = (url, query) => {
		let item = _findCacheItem(url, query)
		return item ? item.response : null
	}

	this.setCache = (url, query, response) => {
		let item = _findCacheItem(url, query)
		if (!item) {
			cache.push({ url, query, response })
		} else {
			item.response = response
		}
	}

	this.clearCache = (urls) => {
		urls = Array.isArray(urls) ? urls : [urls]
		for (let url of urls) {
			let index
			while ((index = _findCacheItemIndex(url, false)) >= 0) {
				cache.splice(index, 1)
			}
		}
	}

	for (let method of ['get', 'post', 'put', 'delete']) {
		this[method] = async (url, options = {}) => {
			return await _call(this, method, url, options)
		}
	}
}

Api.install = function(Vue, options) {
	for (let key in options) {
		Vue.prototype[`$${key}`] = options[key]
	}
}

export default Api
