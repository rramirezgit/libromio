<script>
export default {
	name: 'GoogleAuthButton',
	data() {
		return {
			loading: false,
			clientId: this.$srv('SocialLogin.googleClientId'),
		}
	},
	methods: {
		async handleGoogleSignIn() {
			this.loading = true
			setTimeout(() => (this.loading = false), 1000)

			const googleUser = await this.$gAuth.signIn()
			if (!googleUser) return null

			const { access_token } = googleUser.getAuthResponse()
			await this.$shopApi.post({
				url: '/user/auth/google',
				data: { googleAccessToken: access_token },
				loading: (v) => (this.loading = v),
				done: ({ success, data }) => {
					if (success) {
						this.$store.set('shop/user', data.user)
						this.$store.set('shop/loginDrawer', false)
					}
				},
			})
		},
	},
}
</script>

<template>
	<v-btn v-if="clientId" :loading="loading" @click="handleGoogleSignIn" tile color="#de5246" dark>
		<v-icon text class="pa-1">
			mdi-google
		</v-icon>
		GOOGLE
	</v-btn>
</template>
