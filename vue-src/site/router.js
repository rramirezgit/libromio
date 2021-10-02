import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

// Load routes
let requireRoutes = require.context('@/site', true, /.+\/routes_[\w-]+\.js$/)
let allRoutes = []
for (let file of requireRoutes.keys()) {
	let routes = requireRoutes(file).default
	allRoutes = allRoutes.concat(routes)
}

allRoutes.sort((a, b) => {
	if (a.position == 'last') return 1
	if (b.position == 'last') return -1
	if (a.position == 'first') return -1
	if (b.position == 'first') return 1
	return (a.position || 0) - (b.position || 0)
})

const router = new Router({
	mode: 'history',
	scrollBehavior: (to, from, savedPosition) => {
		if (to.params.savePosition) return {}
		if (to.hash) return { selector: to.hash }
		if (savedPosition) return savedPosition
		return { x: 0, y: 0 }
	},
	routes: allRoutes,
})

router.beforeEach((to, from, next) => {
	to.path != '/' && to.path.endsWith('/') ? next(to.path.replace(/\/+$/, '')) : next()
})

router.afterEach((to) => {
	window.fbq && window.fbq('track', 'PageView')
	if (window.hideBotIframe) {
		if (to.name.startsWith('checkout')) window.hideBotIframe()
		else window.showBotIframe()
	}
})

export default router
