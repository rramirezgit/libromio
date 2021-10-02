<script>
export default {
	name: 'OrderSummaryMobile',
	props: {
		order: Object,
	},
	data() {
		return {
			dialog: false,
		}
	},
	methods: {
		toggleDialog() {
			this.dialog = !this.dialog
		},
	},
}
</script>

<template>
	<div>
		<div
			@click="toggleDialog"
			class="flex-nowrap text-right bottom-bar pa-3 font-3 d-flex flex-row justify-center align-center"
		>
			<div class="d-flex flex-column px-5">
				<span class="font-weight-bold">TOTAL</span>
				<PriceText :amount="order.total" class="font-5" />
			</div>
			<v-btn color="primary" text> Ver resumen <v-icon class="ml-1">mdi-chevron-up</v-icon></v-btn>
		</div>
		<v-dialog
			v-model="dialog"
			v-if="order"
			fullscreen
			hide-overlay
			transition="dialog-bottom-transition"
			scrollable
		>
			<div @click="toggleDialog" class="order-parent">
				<OrderSummary :order="order" :showHideBtn="true" />
			</div>
		</v-dialog>
	</div>
</template>

<style scoped>
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	background-color: #fff;
	cursor: pointer;
}
.order-parent {
	background-color: #fff;
}

.high-index {
	z-index: 1;
}
</style>
