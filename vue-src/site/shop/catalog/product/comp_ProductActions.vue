<script>
export default {
	props: {
		selectedVariant: Object,
		unitMetric: String,
		priceMetric: String,
		ctaText: String,
	},
	data() {
		return {
			ctaIsLoading: false,
			qty: 1,
			checkout: null,
			mpId: null,
		}
	},
	computed: {
		outOfStock() {
			return this.selectedVariant.stock.availability == 'OutOfStock'
		},
		maxStockQty() {
			let { maxBuyableQty, infiniteQty, qty } = this.selectedVariant.stock
			if (maxBuyableQty >= 1) {
				if (infiniteQty) return maxBuyableQty
				else return Math.min(qty, maxBuyableQty)
			} else {
				if (infiniteQty) return 0
				else return qty
			}
		},
	},
	methods: {
		ctaClicked() {
			this.$shopApi.post({
				url: '/cart/item',
				loading: (v) => (this.ctaIsLoading = v),
				data: {
					id: this.selectedVariant.id,
					type: 'product',
					qty: this.qty,
				},
				onSuccess: async ({ data }) => {
					this.$store.set('cart/order', data.order)
					this.$store.set('shop/cartDrawer', true)
				},
			})
		},
	},
}
</script>

<template>
	<div>
		<QtyInput
			v-if="selectedVariant.type == 'physical' && !outOfStock"
			v-model="qty"
			:max-qty="maxStockQty"
			:metric="unitMetric"
		/>
		<ProductStockQtyMessage
			v-if="selectedVariant.type == 'physical'"
			:stock="selectedVariant.stock"
			:metric="unitMetric"
			class="pt-2 grey--text"
			style="font-size: .9rem"
		/>
		<div class="pt-4">
			<v-btn
				:loading="ctaIsLoading"
				@click="ctaClicked"
				color="primary"
				class="px-10"
				large
				:disabled="outOfStock"
				tile
			>
				{{ ctaText || 'Comprar' }}
			</v-btn>
		</div>
	</div>
</template>
