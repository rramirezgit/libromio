<script>
import { sync } from 'vuex-pathify'
export default {
	name: 'Drawer',
	computed: {
		...sync('app', ['drawer', 'mini']),
	},
}
</script>

<template>
	<v-navigation-drawer
		class="primary darken-4"
		v-model="drawer"
		:right="$vuetify.rtl"
		:mini-variant.sync="mini"
		mini-variant-width="80"
		app
		dark
		width="260"
	>
		<div class="px-2">
			<DrawerHeader />
		</div>
		<v-divider class="mx-3 mb-2" />
		<DrawerNavList />
	</v-navigation-drawer>
</template>
