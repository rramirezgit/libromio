<script>
import { get, sync } from 'vuex-pathify'

export default {
	name: 'MobileMenuDrawer',
	computed: {
		menuMobileDrawer: sync('shop/menuMobileDrawer'),
		user: get('shop/user'),
	},
	methods: {
		showLoginDrawer() {
			this.menuMobileDrawer = false
			this.$nextTick(() => {
				this.$store.set('shop/loginDrawer', true)
			})
		},
	},
}
</script>

<template>
	<v-navigation-drawer
		class="pa-4 pr-0 pl-0 drawer-index"
		v-model="menuMobileDrawer"
		width="600"
		max-width="100%"
		overlay-color="#000"
		temporary
		:overlay-opacity="0.8"
		fixed
	>
		<v-list-item class="px-2 pb-3">
			<div class="pl-4"></div>
			<v-spacer></v-spacer>
			<v-btn :ripple="false" plain text @click="menuMobileDrawer = false">
				<v-icon x-large>mdi-close</v-icon>
			</v-btn>
		</v-list-item>
		<div class="pl-4">
			<div class="ml-5 mb-3">
				<router-link :to="{ name: 'home' }">
					<img
						:alt="$srv('BusinessInfo.name')"
						class="shrink mr-sm-2 mr-10"
						:src="$srv('SiteLogo.logo')"
						width="200"
						style="width: auto; height: 60px;"
					/>
				</router-link>
			</div>
			<v-list-item
				v-for="(linkData, i) of $srv('SiteNavbarLinks')"
				:key="i"
				:to="linkData.link"
				@click="menuMobileDrawer = false"
				class="font-3 font-weight-bold pt-3 pb-3"
			>
				{{ linkData.text }}
			</v-list-item>
			<v-list-item
				v-if="user"
				:to="{ name: 'user.account' }"
				@click="menuMobileDrawer = false"
				class="font-3 font-weight-bold pt-3 pb-3"
			>
				<span>Mi cuenta</span>
			</v-list-item>
			<v-list-item v-else @click.stop="showLoginDrawer" class="font-3 font-weight-bold pt-3 pb-1">
				<span>Mi cuenta</span>
			</v-list-item>
			<div class="mt-14 ml-4">
				<v-btn fab dark color="primary elevation-0" class="mr-6">
					<v-icon>mdi-facebook</v-icon>
				</v-btn>
				<v-btn fab dark color="primary" class="mr-6 elevation-0">
					<v-icon>mdi-instagram</v-icon>
				</v-btn>
				<v-btn fab dark color="primary" class="elevation-0">
					<v-icon>mdi-email</v-icon>
				</v-btn>
			</div>
		</div>
	</v-navigation-drawer>
</template>
