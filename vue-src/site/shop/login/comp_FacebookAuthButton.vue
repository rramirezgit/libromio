<script>
import { VFBLoginScope } from 'vue-facebook-login-component'
export default {
	name: 'FacebookAuthButton',
	components: {
		VFBLoginScope,
	},
	data() {
		return {
			FB: null,
			scope: null,
			loading: false,
			appId: this.$srv('SocialLogin.facebookAppId'),
		}
	},
	methods: {
		handleSdkInit({ FB, scope }) {
			this.FB = FB
			this.scope = scope
		},
		async login() {
			await this.scope?.login()
			const facebookId = this.FB?.getUserID()
			if (!facebookId) return
			const facebookAccessToken = this.FB?.getAccessToken()
			if (!facebookAccessToken) return

			await this.$shopApi.post({
				url: '/user/auth/facebook',
				data: { facebookId, facebookAccessToken },
				loading: (v) => (this.loading = v),
				done: ({ success, data }) => {
					if (success) {
						this.$store.set('shop/user', data.user)
						this.$store.set('shop/loginDrawer', false)
						this.scope.logout()
					}
				},
			})
		},
	},
}
</script>

<template>
	<VFBLoginScope v-if="appId" :app-id="appId" version="v11.0" @sdk-init="handleSdkInit">
		<template #default="{working}">
			<v-btn :loading="working || loading" @click="login" tile color="#3b5998" dark>
				<v-icon text class="pa-1">
					mdi-facebook
				</v-icon>
				FACEBOOK
			</v-btn>
		</template>
	</VFBLoginScope>
</template>
