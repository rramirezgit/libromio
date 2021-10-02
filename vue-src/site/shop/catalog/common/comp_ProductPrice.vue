<script>
export default {
	name: 'ProductPrice',
	props: {
		amount: Number,
		customClass: {
			type: String,
			default: 'black--text font-4',
		},
	},
}
</script>

<template>
	<PriceText :amount="amount" :class="customClass" />
</template>
