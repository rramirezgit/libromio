import Vue from 'vue'
import Srv from '@/__shared/utils/lib_srv'
import GAuth from 'vue-google-oauth2'

let googleClientId = Srv('SocialLogin.googleClientId')
if (googleClientId) {
	Vue.use(GAuth, { clientId: googleClientId, scope: 'profile email', prompt: 'select_account' })
}
