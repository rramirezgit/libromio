import Vue from 'vue'
import Api from '@/__shared/utils/lib_api'

const adminApi = new Api({
	baseUrl: `${process.env.VUE_APP_ADMIN_API_BASE_URL}`,
})

Vue.use(Api, { adminApi })
