import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

// Load routes
let requireRoutes = require.context('@/admin', true, /.+\/routes_[\w-]+\.js$/)
let allRoutes = []
for (let file of requireRoutes.keys()) {
	let routes = requireRoutes(file).default
	allRoutes = allRoutes.concat(routes)
}

const router = new Router({
	mode: 'history',
	base: process.env.VUE_APP_ADMIN_BASE_URL,
	scrollBehavior: (to, from, savedPosition) => {
		if (to.hash) return { selector: to.hash }
		if (savedPosition) return savedPosition
		return { x: 0, y: 0 }
	},
	routes: allRoutes,
})

router.beforeEach((to, from, next) => {
	to.path != '/' && to.path.endsWith('/') ? next(to.path.replace(/\/+$/, '')) : next()
})

export default router
