<script>
export default {
	name: 'Standard-Carrier-CheckoutConfirmCardContent',
	props: {
		order: Object,
	},
	computed: {
		trackingNumber() {
			return this.order.delivery.externalData?.trackingNumber
		},
	},
}
</script>

<template>
	<div v-if="trackingNumber" class="pt-3">
		El número de seguimiento del envío es <b>{{ trackingNumber }}</b>
	</div>
</template>
