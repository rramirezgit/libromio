<script>
export default {
	name: 'PriceLayout',
	props: {
		prevPrice: Number,
		price: Number,
		discountPct: Number,
		hidePrevPrice: Boolean,
		hideDiscount: Boolean,
		priceClass: String,
		discountClass: String,
		prevPriceClass: String,
	},
	computed: {
		hasPrevPrice() {
			return this.prevPrice && this.prevPrice > this.price
		},
		hasDiscountPct() {
			return this.discountPct > 0
		},
	},
}
</script>

<template>
	<div>
		<div v-if="!hidePrevPrice && hasPrevPrice">
			<ProductPrevPrice :amount="prevPrice" :customClass="prevPriceClass" />
		</div>
		<div class="d-flex align-center">
			<ProductPrice :amount="price" :customClass="priceClass" />
			<ProductDiscount
				v-if="!hideDiscount && hasDiscountPct"
				:amount="discountPct"
				class="ml-2"
				:customClass="discountClass"
			/>
		</div>
	</div>
</template>
