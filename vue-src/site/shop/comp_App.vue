<script>
export default {
	name: 'App',
	metaInfo() {
		let siteName = this.$srv('BusinessInfo.name')
		return {
			titleTemplate: (title) => {
				return title && siteName ? `${title} | ${siteName}` : title || siteName || 'Shop'
			},
		}
	},
	computed: {
		isCheckout() {
			return this.$route.name?.startsWith('checkout')
		},
	},
}
</script>

<template>
	<v-app>
		<AppBar v-if="!isCheckout" />
		<MobileMenuDrawer />
		<LoginDrawer />
		<CartDrawer />
		<v-main>
			<router-view />
		</v-main>
		<Footer v-if="!isCheckout" />
	</v-app>
</template>

<style>
.v-application {
	overflow: hidden;
}
.v-window__prev,
.v-window__next {
	background: rgba(0, 0, 0, 0) !important;
}
</style>
