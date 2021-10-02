<script>
export default {
	name: 'CatalogCollections',
	async created() {
		this.$store.set('app/title', 'Colecciones')
	},
}
</script>

<template>
	<CollectionsTable />
</template>
