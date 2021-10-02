const fs = require('fs')
const path = require('path')

const plugits = {}

function loadPlugit(key, opts = {}) {
	let { isPlugin = false, isEntry = false, initialize = false } = opts

	if (plugits[key]) return
	plugits[key] = true

	let error = (msg) => {
		throw new Error(`Plugit '${key}' error: ${msg}`)
	}

	const jsonPath = path.resolve('plugit', key, 'plugit.json')
	if (!fs.existsSync(jsonPath)) {
		error(`No plugit.json file found in '${jsonPath}'`)
	}

	const def = require(jsonPath)

	if (isPlugin) {
		if (!def.plugin === true) {
			error(`the plugit is not defined as plugin on its plugit.json file`)
		}
		if (!def.parent) {
			error(`the plugin's parent on its plugit.json file`)
		}
	}

	if (def.parent && !plugits[def.parent]) {
		error(`the plugit needs '${def.parent}' to be loaded first`)
	}

	const indexPath = path.resolve('plugit', key, 'index')
	const plugitIndex = require(indexPath)

	let { requires = [], children = [], plugins = [] } = def

	//Initialize plugit dependencies
	for (let _key of requires) {
		loadPlugit(_key, { initialize })
	}

	if (!isEntry && initialize) {
		plugitIndex.__init && plugitIndex.__init()
	}

	//Initialize plugit children
	for (let _key of children) {
		loadPlugit(_key, { initialize })
	}

	//Initialize plugit plugins
	for (let _key of plugins) {
		loadPlugit(_key, { initialize, isPlugin: true })
	}

	if (isEntry && initialize) {
		plugitIndex.__init && plugitIndex.__init()
	}
}

const Plugit = {}
let loaded = false
Plugit.load = (initialize = true) => {
	if (loaded) return
	loaded = true

	let configFilename = 'plugit.config.js'
	let configPath = path.resolve(configFilename)
	if (!fs.existsSync(configPath)) {
		throw new Error(`No plugit config file found in '${configPath}'`)
	}

	const config = require(configPath)
	let { entry } = config
	if (!entry) {
		throw new Error(`No entry plugit found in ${configFilename}`)
	}
	loadPlugit(entry, { initialize, isEntry: true })
}

// Guard against bad plugit requires
;(() => {
	let BuiltinModule = require('module')

	// Guard against poorly mocked module constructors
	let Module = module.constructor.length > 1 ? module.constructor : BuiltinModule

	let oldResolveFilename = Module._resolveFilename
	Module._resolveFilename = function(request, parentModule, isMain, options) {
		if (request.match(/^#\/.+\/.*$/)) {
			throw new Error('No te hagas el vivo ' + request)
		}

		return oldResolveFilename.call(this, request, parentModule, isMain, options)
	}
})()

module.exports = Plugit
