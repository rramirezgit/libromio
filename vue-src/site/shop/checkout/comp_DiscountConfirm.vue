<script>
export default {
	name: 'discount-confirm',
	props: {
		order: Object,
	},
}
</script>

<template>
	<CardLayout title="Descuento Aplicado" v-bind="$attrs" v-on="$listeners">
		<div v-if="order.discount" class="d-flex align-center">
			<v-icon class="mr-1">mdi-star</v-icon>
			<span>{{ order.discount.discountName }}</span>
		</div>
		<div v-else>No se aplicó cupón de descuento</div>
	</CardLayout>
</template>
