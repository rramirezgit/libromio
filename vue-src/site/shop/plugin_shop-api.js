import Vue from 'vue'
import Api from '@/__shared/utils/lib_api'

const shopApi = new Api({
	baseUrl: `${process.env.VUE_APP_SHOP_API_BASE_URL}`,
})

Vue.use(Api, { shopApi })

export { shopApi }
