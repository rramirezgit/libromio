<script>
export default {
	name: 'CatalogBrands',
	data() {
		return {
			brands: [],
			loading: true,
		}
	},
	async created() {
		this.$store.set('app/title', 'Marcas')
	},
}
</script>

<template>
	<BrandsTable />
</template>
