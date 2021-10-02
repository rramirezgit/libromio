<script>
import { BasePriceLayout } from '@/site/autoloader'

export default {
	extends: BasePriceLayout,
}
</script>

<template>
	<div>
		<div v-if="!hidePrevPrice && hasPrevPrice">
			<ProductPrevPrice :amount="prevPrice" customClass="primary-dark-purple--text" />
		</div>
		<div class="d-flex align-center">
			<ProductPrice :amount="price" customClass="primary-dark-purple--text font-4 font-weight-bold" />
			<ProductDiscount v-if="!hideDiscount && hasDiscountPct" :amount="discountPct" />
		</div>
	</div>
</template>
