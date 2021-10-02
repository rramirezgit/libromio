<script>
export default {
	props: {
		stock: Object,
		metric: String,
	},
	computed: {
		availability() {
			return this.stock.availability
		},
		qty() {
			return this.stock.qty
		},
		infiniteQty() {
			return this.stock.infiniteQty
		},
		metricWord() {
			let spl = this.metric.split('/')
			return this.qty == 1 ? spl[0] : spl.join('')
		},
	},
}
</script>

<template>
	<div v-if="availability != 'OutOfStock' && !infiniteQty">
		<span v-if="qty == 1">Última disponible!</span>
		<span v-else>{{ qty }} disponibles</span>
	</div>
</template>
