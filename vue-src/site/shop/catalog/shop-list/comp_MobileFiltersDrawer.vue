<script>
export default {
	name: 'MobileFiltersDrawer',
	props: {
		loading: Boolean,
		title: String,
		totalResults: Number,
		categoryItems: Array,
		collectionItems: Array,
		brandItems: Array,
		sortByItems: Array,
		attrsGroups: Array,
		removalChips: Array,
		breadcrumbs: Array,
	},
	methods: {
		addFilter(type, value) {
			this.$emit('filterAdded', { type, value })
		},
		removeFilter(type, value) {
			this.$emit('filterRemoved', { type, value })
		},
		breadcrumbClick(value) {
			this.$emit('breadcrumbClicked', value)
		},
		methods: {
			closeDrawer() {
				this.$store.dispatch('app/toggleMenuMobileDrawer', false)
			},
		},
	},
}
</script>

<template>
	<v-navigation-drawer class="pa-4 pr-0 pl-0" :value="menuMobileDrawer" stateless fixed width="600">
		<v-list-item class="px-2">
			<div class="pl-4">
				Filtros
			</div>
			<v-spacer></v-spacer>
			<v-btn :ripple="false" plain text @click="closeDrawer">
				<v-icon x-large>mdi-close-circle</v-icon>
			</v-btn>
		</v-list-item>
		<v-divider class="mb-4"></v-divider>
		<div></div>
	</v-navigation-drawer>
</template>

<style scoped>
.v-breadcrumbs {
	padding: 0 0 16px 0;
	display: block;
}
.v-breadcrumbs >>> a,
.v-breadcrumbs >>> .v-breadcrumbs__divider {
	display: inline;
	vertical-align: middle;
	padding: 0;
	transition: opacity 0.3s;
}
.v-breadcrumbs >>> .v-breadcrumbs__divider {
	position: relative;
	top: -1px;
}
.v-breadcrumbs >>> a:not(:hover) {
	opacity: 0.6;
}
</style>
