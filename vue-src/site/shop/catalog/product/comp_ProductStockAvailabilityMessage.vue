<script>
export default {
	props: {
		stock: Object,
	},
	computed: {
		availability() {
			return this.stock.availability
		},
		preOrderDays() {
			return this.stock.deferredDelivery
		},
		qty() {
			return this.stock.qty
		},
		infiniteQty() {
			return this.stock.infiniteQty
		},
		icon() {
			switch (this.availability) {
				case 'OutOfStock':
					return 'mdi-cancel'
				case 'PreSale':
					return 'mdi-clock'
				case 'PreOrder':
					return 'mdi-clock'
				case 'InStock':
				default:
					return 'mdi-check'
			}
		},
	},
}
</script>

<template>
	<div class="d-flex align-center">
		<v-icon class="mr-2">{{ icon }}</v-icon>
		<span v-if="availability == 'OutOfStock'">
			No disponible en stock
		</span>
		<span v-else-if="availability == 'PreSale'">
			Disponible a partir del {{ stock.availabilityDate | date }}
		</span>
		<span v-else-if="availability == 'PreOrder'">
			Disponible en {{ preOrderDays }} día{{ preOrderDays == 1 ? '' : 's' }} a partir de la compra
		</span>
		<span v-else>
			Disponible en stock
		</span>
	</div>
</template>
