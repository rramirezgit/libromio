import Vue from 'vue'
import { sync as vuexRouterSync } from 'vuex-router-sync'
import App from './App.vue'
import router from './router'
import store from './store'
import './styles.scss'

Vue.config.productionTip = false

// Load Components
let requireComponent = require.context('@/admin', true, /\/comp_[\w-]+\.vue$/)
for (let file of requireComponent.keys()) {
	let comp = requireComponent(file).default
	Vue.component(comp.name, comp)
}

// Load Plugins
let requirePlugin = require.context('@/admin', true, /\/plugin_[\w-]+\.js$/)
let plugins = {}
for (let file of requirePlugin.keys()) {
	let plugin = requirePlugin(file).default
	Object.assign(plugins, plugin || {})
}

// Vuex Router Sync
vuexRouterSync(store, router)

new Vue({
	...plugins,
	router,
	store,
	render: (h) => h(App),
}).$mount('#app')
