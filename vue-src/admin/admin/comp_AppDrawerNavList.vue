<script>
import { get } from 'vuex-pathify'
export default {
	name: 'DrawerNavList',
	computed: {
		mini: get('app/mini'),
		navSections() {
			let routes = this.$store.get('app/routes')
			return (
				routes &&
				routes
					.map((section) => {
						return {
							...section,
							pages: section.pages
								.filter((page) => !!page.nav)
								.sort((a, b) => a.nav.position - b.nav.position),
						}
					})
					.filter((section) => !!section.pages.length)
					.sort((a, b) => a.nav.position - b.nav.position)
			)
		},
	},
}
</script>

<template>
	<v-list dense nav v-if="navSections">
		<v-list-item-group>
			<template v-for="section in navSections">
				<v-list-item :key="section.key" v-show="!mini" disabled>
					<v-subheader v-text="section.nav.title" class="text-overline" />
				</v-list-item>
				<v-list-item
					v-for="page of section.pages"
					:key="page.key"
					:to="page.path"
					@click.stop=""
				>
					<v-list-item-icon>
						<v-icon>mdi-{{ page.nav.icon }}</v-icon>
					</v-list-item-icon>
					<v-list-item-content>
						<v-list-item-title v-text="page.nav.title" />
					</v-list-item-content>
				</v-list-item>
			</template>
		</v-list-item-group>
	</v-list>
</template>
