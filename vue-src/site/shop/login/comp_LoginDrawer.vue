<script>
import { sync } from 'vuex-pathify'

export default {
	name: 'LoginDrawer',
	data: () => ({
		windowToShow: 'login',
		title: 'INGRESÁ',
	}),
	computed: {
		closeBtnIcon() {
			return this.windowToShow == 'login' ? 'mdi-close-circle' : 'mdi-chevron-left-circle'
		},
		loginDrawer: sync('shop/loginDrawer'),
	},
	watch: {
		loginDrawer(value) {
			if (value) this.openLogin()
		},
	},
	methods: {
		closeDrawer() {
			if (this.windowToShow == 'login') this.loginDrawer = false
			else this.openLogin()
		},
		openForgot() {
			this.windowToShow = 'forgot'
			this.title = 'RECUPERÁ TU CONTRASEÑA'
		},
		openLogin() {
			this.windowToShow = 'login'
			this.title = 'INGRESÁ'
		},
		openNew() {
			this.windowToShow = 'new'
			this.title = 'REGISTRATE'
		},
	},
}
</script>

<template>
	<v-navigation-drawer
		class="pa-4"
		v-model="loginDrawer"
		fixed
		width="600"
		max-width="100%"
		overlay-color="#000"
		temporary
		:right="$vuetify.breakpoint.xs"
		:overlay-opacity="0.8"
	>
		<v-list-item class="px-2">
			<div class="font-weight-bold text-h5">
				{{ title }}
			</div>
			<v-spacer></v-spacer>

			<v-btn :ripple="false" plain text @click="closeDrawer">
				<v-icon x-large> {{ closeBtnIcon }}</v-icon>
			</v-btn>
		</v-list-item>

		<v-divider class="mb-4" />
		<LoginForm v-if="this.windowToShow == 'login'" @openForgot="openForgot" @openNew="openNew" />
		<ForgotForm v-if="this.windowToShow == 'forgot'" @openLogin="openLogin" />
		<SignupForm v-if="this.windowToShow == 'new'" @openLogin="openLogin" />
	</v-navigation-drawer>
</template>
