<script>
export default {
	name: 'CatalogCategories',
	data() {
		return {
			categories: [],
			loading: true,
		}
	},
	async created() {
		this.$store.set('app/title', 'Categorías')
	},
}
</script>

<template>
	<CategoryTree />
</template>
