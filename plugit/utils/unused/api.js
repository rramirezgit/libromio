const { Router } = require('express')
const { kebabCase, camelCase } = require('case-anything')

class Api {
	constructor(key) {
		this._basePath = `/${kebabCase(key)}`
		this._callerKey = camelCase(key)
		this._endpoints = []
	}

	_register(method, name, path, ...fns) {
		this._endpoints.push({
			method,
			name,
			path,
			fns,
		})
	}

	get(name, path, ...fns) {
		this._register('get', name, path, fns)
	}
	post(name, path, ...fns) {
		this._register('post', name, path, fns)
	}
	delete(name, path, ...fns) {
		this._register('delete', name, path, fns)
	}
	put(name, path, ...fns) {
		this._register('put', name, path, fns)
	}

	static _prepareFnsForRouter(fns) {
		return fns.map((fn) => async (req, res, next) => {
			try {
				await fn(req, res)
				next()
			} catch (err) {
				next(err)
			}
		})
	}

	_router() {
		let router = Router()
		for (let endpoint of this._endpoints) {
			let fns = Api._prepareFnsForRouter(endpoint.fns)
			router[endpoint.method](endpoint.path, ...fns)
		}
		let mainRouter = Router()
		mainRouter.use(this._basePath, router)
		return mainRouter
	}

	_caller() {
		let key = this._callerKey
		let methods = ['get', 'post', 'delete', 'put']
		return (req, res, next) => {
			req[key] = {}
			for (let method of methods) {
				req[key][method] = async (name) =>
					await this._call(method, name, req, res)
			}
			next()
		}
	}

	_apiResponse() {
		return (req, res, next) => {
			res.apiRes = new ApiResponse(res)
		}
	}

	async _call(method, name, req, res) {
		let endpoint = this._endpoints.find(
			(endpoint) => endpoint.method == method && endpoint.name == name
		)
		if (!endpoint) return
		for (let fn of endpoint.fns) {
			await fn(req, res)
		}
	}

	load() {
		return [this._caller(), this._apiResponse(), this._router()]
	}
}

module.exports = Api
