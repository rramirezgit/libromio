<script>
export default {
	name: 'CatalogPriceConfig',
	data() {
		return {
			categories: [],
			loading: true,
		}
	},
	async created() {
		this.$store.set('app/title', 'Configurador de Precios')
	},
}
</script>

<template>
	<PriceConfigTable />
</template>
