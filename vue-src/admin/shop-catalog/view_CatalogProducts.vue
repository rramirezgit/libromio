<script>
export default {
	name: 'CatalogProducts',
	created() {
		this.$store.set('app/title', 'Productos')
	},
	data() {
		return {}
	},
}
</script>

<template>
	<ProductsTable />
</template>
