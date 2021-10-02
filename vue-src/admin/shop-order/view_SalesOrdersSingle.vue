<script>
import { get } from 'vuex-pathify'
export default {
	name: 'SalesOrdersSingle',
	computed: {
		routeOrderId: get('route@params.id'),
	},
	created() {
		this.$store.set('app/title', 'Detalle de la orden')
	},
}
</script>

<template>
	<OrderDetail :order-id="routeOrderId" />
</template>
