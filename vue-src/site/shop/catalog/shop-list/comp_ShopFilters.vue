<script>
export default {
	name: 'ShopFilters',
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
	},
}
</script>

<template>
	<div>
		<div v-if="loading">
			<div v-for="i in Array(2).keys()" :key="i" class="mb-10">
				<v-skeleton-loader type="heading" loading />
				<br />
				<v-skeleton-loader type="text" v-for="i in Array(3).keys()" :key="i" loading class="my-3 pr-10" />
			</div>
		</div>
		<div v-else>
			<v-breadcrumbs :items="breadcrumbs" v-if="breadcrumbs.length">
				<template v-slot:divider>
					<v-icon>mdi-chevron-right</v-icon>
				</template>
				<template v-slot:item="{ item }">
					<a
						class="breadcrumb-item font-weight-bold font-subtitle-1 px-0 text-uppercase"
						@click.prevent="breadcrumbClick(item.value)"
					>
						{{ item.text.toUpperCase() }}
					</a>
				</template>
			</v-breadcrumbs>
			<div class="text-h4 font-weight-bold text-uppercase">
				{{ title }}
			</div>
			<div class="font-subtitle-2 mt-1">
				{{ totalResults }} resultado{{ totalResults != 1 ? 's' : '' }}
			</div>
			<v-chip
				v-for="item of removalChips"
				:key="item.text"
				class="mt-4 mr-4"
				close
				@click="removeFilter(item.type, item.value)"
				@click:close="removeFilter(item.type, item.value)"
			>
				{{ item.text }}
			</v-chip>
			<ShopFiltersGroup :items="collectionItems" @filterClick="addFilter('collection', $event.value)" />
			<ShopFiltersGroup
				:items="sortByItems"
				title="Ordernar por"
				@filterClick="addFilter('sortBy', $event.value)"
			/>
			<ShopFiltersGroup
				:items="categoryItems"
				title="Categoría"
				@filterClick="addFilter('category', $event.value)"
			/>
			<ShopFiltersGroup
				:items="brandItems"
				title="Marca"
				@filterClick="addFilter('brand', $event.value)"
			/>
			<ShopFiltersGroup
				v-for="(group, i) of attrsGroups"
				:key="i"
				:items="group.items"
				:title="group.title"
				@filterClick="addFilter('attr', $event.value)"
			/>
		</div>
	</div>
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
