import store from '@/site/store'
import { shopApi } from './plugin_shop-api'

store.watch(
	() => store.get('shop/user'),
	(user) => {
		if (user) {
			shopApi.get({
				url: '/wishlist/products-ids',
				onSuccess: ({ data }) => {
					store.set('shop/wishlistIds', data.productsIds)
				},
			})
		} else {
			store.set('shop/wishlistIds', [])
		}
	}
)
