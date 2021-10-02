import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

// Load Components
let requireComponent = require.context('@/admin-login', true, /.+\/comp_[\w-]+\.vue$/)
for (let file of requireComponent.keys()) {
	let comp = requireComponent(file).default
	Vue.component(comp.name, comp)
}

// Load Plugins
let requirePlugin = require.context('@/admin-login', true, /.+\/plugin_[\w-]+\.js$/)
let plugins = {}
for (let file of requirePlugin.keys()) {
	let plugin = requirePlugin(file).default
	Object.assign(plugins, plugin || {})
}

new Vue({
	...plugins,
	render: (h) => h(App),
}).$mount('#app')
