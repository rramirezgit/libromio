<script>
export default {
	name: 'SalesOrders',
	created() {
		this.$store.set('app/title', 'Órdenes de compra')
	},
}
</script>

<template>
	<OrdersTable />
</template>
