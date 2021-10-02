<script>
import LocalPickupCardContent from './comp_LocalPickupCardContent'

export default {
	name: 'LocalPickup-Delivery-CheckoutOptions',
	components: {
		LocalPickupCardContent,
	},
	props: {
		data: Object,
	},
	methods: {
		onOptionClick(option) {
			this.$emit('optionSelected', { key: option.key })
		},
	},
}
</script>

<template>
	<div>
		<CardLayout @cardClick="onOptionClick(option)" v-for="(option, i) of data.options" :key="i" clickable>
			<LocalPickupCardContent :data="option" />
		</CardLayout>
	</div>
</template>
