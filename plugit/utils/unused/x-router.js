const fs = require('fs')
const { Router } = require('express')

const namedRoutes = {}
const urlParamsBuilders = {}
let loaded = false

function XRouterObj(basePath) {
	let _router = (this.r = Router())
	let _basePath = !basePath || basePath == '/' ? '' : basePath

	let _callRouterMethod = (method, args) => {
		_router[method](...args)
	}
	let _callNamedRouteMethod = (method, args) => {
		let routesMap = args[0],
			routerArgs
		if (typeof routesMap !== 'object') {
			let routeName = args[0],
				routePath = args[1]
			routesMap = {}
			routesMap[routeName] = routePath
			routerArgs = args.slice(2)
		} else {
			routerArgs = args.slice(1)
		}

		Object.keys(routesMap).forEach((routeName) => {
			let obj =
				typeof routesMap[routeName] === 'object'
					? routesMap[routeName]
					: { path: routesMap[routeName] }

			let routerPath = obj.path
			obj.path = `${_basePath}${obj.path == '/' ? '' : obj.path}`

			namedRoutes[routeName] = obj
			_callRouterMethod(method, [routerPath].concat(routerArgs))
		})
	}

	this.get = (...args) => {
		_callNamedRouteMethod('get', args)
	}
	this.post = (...args) => {
		_callNamedRouteMethod('post', args)
	}
	this.put = (...args) => {
		_callNamedRouteMethod('put', args)
	}
	this.delete = (...args) => {
		_callNamedRouteMethod('delete', args)
	}
	this.use = (...args) => {
		_callRouterMethod('use', args)
	}
	this.param = (...args) => {
		_callRouterMethod('param', args)
	}
	this.basePath = (basePath) => {
		if (basePath === undefined) {
			return _basePath
		} else {
			_basePath = basePath
		}
	}
}

function _url(routeName, params) {
	if (!routeName) return _url.current

	let obj = namedRoutes[routeName]
	if (!obj) return ''

	params = params || {}
	obj.urlParamsBuilder && obj.urlParamsBuilder(params)

	let finalPath = obj.path
		.split('/')
		.map((part) => {
			if (part.startsWith(':')) {
				let paramKey = part.substr(1)
				let param = urlParamsBuilders[paramKey]
					? urlParamsBuilders[paramKey](params)
					: params[paramKey]
				return param === undefined ? part : param
			} else {
				return part
			}
		})
		.join('/')

	let queryPairs = Object.keys(params)
		.filter((paramKey) => paramKey.startsWith('?') && paramKey != '?')
		.map((paramKey) => [paramKey.substr(1), params[paramKey]])

	if (params['?']) {
		queryPairs = queryPairs.concat(
			Object.keys(params['?']).map((queryKey) => [
				queryKey,
				params['?'][queryKey],
			])
		)
	}

	let queryString = queryPairs
		.filter((pair) => pair[0] && pair[1] !== undefined && pair[1] !== null)
		.map((pair) => `${pair[0]}=${encodeURIComponent(pair[1])}`)
		.join('&')
	queryString = queryString ? `?${queryString}` : ''

	if (!finalPath) {
		finalPath = '/'
	}
	return `${finalPath}${queryString}`
}

_url.abs = (routeName, params) => {
	let url = _url(routeName, params)
	let domain = process.env.APP_URL ?? ''
	return `${domain}${url}`
}

_url.is = (routeName, params) => {
	return _url(routeName, params) == _url()
}

function _urlParamBuilder(param, builder) {
	urlParamsBuilders[param] = builder
}

function _load(folders) {
	if (loaded) return
	loaded = true
	return [_getMiddleware(), _getMainRouter(folders)]
}

function _getMiddleware() {
	return (req, res, next) => {
		res.locals.url = _url
		_url.current = req.originalUrl
		res.xRedirect = function(status, routeName, params) {
			if (typeof status == 'string') {
				params = routeName
				routeName = status
				status = null
			}
			let url = _url(routeName, params)
			status ? res.redirect(status, url) : res.redirect(url)
		}
		next()
	}
}

function _getMainRouter(folders) {
	let mainRouter = Router()
	folders = Array.isArray(folders) ? folders : [folders]
	folders.forEach((folder) => {
		let files = fs.readdirSync(folder).sort()
		files.forEach((file) => {
			if (file.startsWith('__')) return
			let xRouter = require(`../${folder}/${file}`)
			mainRouter.use(xRouter.basePath() || '/', xRouter.r)
		})
	})
	return mainRouter
}

// Export
function XRouter(basePath) {
	return new XRouterObj(basePath)
}
XRouter.XRouter = (basePath) => XRouter(basePath)
XRouter.url = _url
XRouter.urlParamBuilder = _urlParamBuilder
XRouter.load = _load

module.exports = XRouter
