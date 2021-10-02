<script>
export default {
	name: 'ProductPrevPrice',
	props: {
		amount: Number,
		customClass: {
			type: String,
			default: 'grey--text',
		},
	},
}
</script>

<template>
	<del :class="customClass">
		<PriceText :amount="amount" />
	</del>
</template>
