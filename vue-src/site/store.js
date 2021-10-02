// Vue
import Vue from 'vue'
import Vuex from 'vuex'
import pathify from 'vuex-pathify'

Vue.use(Vuex)

// Modules
let modules = {}
let requireStoreModule = require.context('@/site', true, /.+\/store_[\w-]+\.js$/)
for (let file of requireStoreModule.keys()) {
	let storeModule = requireStoreModule(file).default
	modules[storeModule.name] = storeModule
}

// pathify
pathify.options.mapping = 'standard'
pathify.options.strict = true

const store = new Vuex.Store({
	modules,
	plugins: [pathify.plugin],
})

export default store
