import Vue from 'vue'
import Router from 'vue-router'
import LoginView from './view_Login'
import ForgotView from './view_Forgot'

Vue.use(Router)

const router = new Router({
	mode: 'history',
	base: process.env.VUE_APP_ADMIN_BASE_URL,
	routes: [
		{
			path: '/login',
			name: 'login',
			component: LoginView,
		},
		{
			path: '/login/forgot',
			name: 'forgot',
			component: ForgotView,
		},
	],
})

router.beforeEach((to, from, next) => (to.path.endsWith('/') ? next(to.path.replace(/\/+$/, '')) : next()))

export default { router }
