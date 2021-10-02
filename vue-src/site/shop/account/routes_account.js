import store from '@/site/store'
import { UserAccount, UserFavorites, UserOrders, UserOrderDetail } from '@/site/autoloader'

const beforeEnter = (to, from, next) => {
	if (!store.get('shop/user')) {
		next({ name: 'home' })
	} else {
		next()
	}
}

export default [
	{
		beforeEnter,
		path: '/user/account',
		name: 'user.account',
		component: UserAccount,
	},
	{
		beforeEnter,
		path: '/user/favorites',
		name: 'user.favorites',
		component: UserFavorites,
	},
	{
		beforeEnter,
		path: '/user/orders',
		name: 'user.orders',
		component: UserOrders,
	},
	{
		beforeEnter,
		path: '/user/orders/:id',
		name: 'user.order-detail',
		component: UserOrderDetail,
	},
]
