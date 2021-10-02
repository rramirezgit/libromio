<script>
import MercadoPagoCardContent from './comp_MercadoPagoCardContent.vue'

export default {
	name: 'MercadoPago-Payment-CheckoutOptions',
	components: {
		MercadoPagoCardContent,
	},
	methods: {
		cardClick() {
			this.$emit('optionSelected')
		},
	},
}
</script>

<template>
	<CardLayout @cardClick="cardClick" clickable>
		<MercadoPagoCardContent />
	</CardLayout>
</template>
