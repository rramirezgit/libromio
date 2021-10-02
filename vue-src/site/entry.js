import Vue from 'vue'
import { sync as vuexRouterSync } from 'vuex-router-sync'
import App from './App.vue'
import router from './router'
import store from './store'
import './styles.scss'
import './autoloader'

Vue.config.productionTip = false
vuexRouterSync(store, router)

// Load Plugins
let requirePlugin = require.context('@/site', true, /.+\/plugin_[\w-]+\.js$/)
let plugins = {}
for (let file of requirePlugin.keys()) {
	let plugin = requirePlugin(file).default
	Object.assign(plugins, plugin || {})
}

new Vue({
	...plugins,
	router,
	store,
	render: (h) => h(App),
}).$mount('#app')
