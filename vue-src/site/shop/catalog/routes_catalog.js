import { Product, ShopList } from '@/site/autoloader'

let shopBaseUrl = process.env.VUE_APP_SHOP_BASE_URL
let productBaseUrl = process.env.VUE_APP_SHOP_PRODUCT_BASE_URL
if (shopBaseUrl == '/') shopBaseUrl = ''

export default [
	{
		path: `${productBaseUrl}/:urlName/:id`,
		name: 'product',
		component: Product,
	},
	{
		path: `${shopBaseUrl}/:filters+`,
		name: 'shop',
		component: ShopList,
		position: 'last',
	},
]
