<script>
export default {
	name: 'DiscountText',

	props: {
		text: {
			type: String,
			default: 'OFF',
		},
		amount: Number,
	},
}
</script>

<template>
	<span>
		<span>{{ amount }}% {{ text }}</span>
	</span>
</template>
