<script>
export default {
	name: 'ProductDiscount',
	props: {
		customClass: {
			type: String,
			default: 'red--text font-weight-bold font-1',
		},
		amount: Number,
	},
}
</script>

<template>
	<DiscountText :amount="amount" :class="customClass" />
</template>
