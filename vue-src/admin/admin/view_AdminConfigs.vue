<script>
export default {
	name: 'AdminConfigs',
	created() {
		this.$store.set('app/title', 'Configuraciones')
	},
}
</script>

<template>
	<div>
		<ConfigsTable />
	</div>
</template>
