<script>
export default {
	data() {
		return {
			orders: [],
			loading: false,
		}
	},
	methods: {
		loadOrders() {
			this.$shopApi.get({
				url: '/user/orders',
				loading: (v) => (this.loading = v),
				onSuccess: ({ data }) => {
					this.orders = data.orders
				},
			})
		},
	},
	created() {
		this.loadOrders()
	},
}
</script>

<template>
	<UserpanelLayout title="Mis Compras">
		<div v-if="!loading && !orders.length" class="text-center py-16">
			<v-icon x-large color="grey lighten-1">mdi-emoticon-sad-outline</v-icon>
			<div class="font-weight-bold text-h5 mb-4">
				No realizaste ninguna compra
			</div>
			<div class="mb-6 d-flex align-center justify-center">
				<v-icon color="grey lighten-1">mdi-cart-arrow-down</v-icon>
				<div class="ml-2">Agregá productos a tu carrito y <br />realizá tu primera compra!</div>
			</div>
			<div>
				<v-btn class="primary" x-large :to="{ name: 'shop', params: { filters: ['shop'] } }">
					IR A LA TIENDA
				</v-btn>
			</div>
		</div>
		<div v-else-if="loading" class="d-flex align-center justify-center py-16">
			<v-progress-circular size="50" indeterminate color="primary" />
			<div class="ml-4">Cargando tus compras</div>
		</div>
		<template v-else>
			<OrderListCard
				v-for="(order, i) of orders"
				:key="i"
				:order="order"
				link-text="Ver detalle"
				@linkClick="$router.push({ name: 'user.order-detail', params: { id: order.id } })"
			/>
		</template>
	</UserpanelLayout>
</template>

<style></style>
