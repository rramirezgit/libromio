<script>
import { sync, get } from 'vuex-pathify'
export default {
	name: 'AppBar',
	computed: {
		...sync('app', ['drawer', 'mini']),
		title: get('app/title'),
	},
}
</script>
<template>
	<v-app-bar
		id="default-app-bar"
		app
		absolute
		class="v-bar--underline"
		color="transparent"
		:clipped-left="$vuetify.rtl"
		:clipped-right="!$vuetify.rtl"
		height="70"
		flat
	>
		<v-app-bar-nav-icon class="hidden-md-and-up" @click="drawer = !drawer" />
		<v-btn
			class="ml-3 mr-4 hidden-sm-and-down"
			elevation="1"
			fab
			small
			@click="mini = !mini"
		>
			<v-icon>
				{{ mini ? 'mdi-format-list-bulleted' : 'mdi-dots-vertical' }}
			</v-icon>
		</v-btn>

		<v-toolbar-title class="font-weight-light text-h5" v-text="title" />

		<v-spacer />

		<!-- <default-search class="hidden-sm-and-down" /> -->

		<v-btn class="ml-2" min-width="0" text to="/" exact>
			<v-icon>mdi-view-dashboard</v-icon>
		</v-btn>

		<AppBarNotifications />
		<AppBarAccount />

		<!-- <default-account /> -->
	</v-app-bar>
</template>
