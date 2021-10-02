import Vue from 'vue'
import Srv from '@/__shared/utils/lib_srv'
import router from '@/site/router'
import VueGtag from 'vue-gtag'

let id = Srv('Analytics.gaEnabled') && Srv('Analytics.gaId')
if (id) {
	Vue.use(VueGtag, { config: { id } }, router)
}
