<script>
import LocalPickupCardContent from './comp_LocalPickupCardContent'

export default {
	name: 'LocalPickup-Delivery-CheckoutConfirmCardContent',
	components: {
		LocalPickupCardContent,
	},
	props: {
		order: Object,
	},
}
</script>

<template>
	<LocalPickupCardContent :data="order.delivery.data" :extended="order.mainStatus != 'cart'" />
</template>
