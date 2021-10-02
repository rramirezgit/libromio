<script>
export default {
	props: {
		showDialog: Boolean,
		items: Array,
		carouselIndex: Number,
	},
	methods: {
		closeDialog() {
			this.$emit('closeDialog')
		},
	},
}
</script>

<template>
	<v-dialog
		:value="showDialog"
		overlay-opacity="0.8"
		overlay-color="black"
		class="responsive-dialog elevation-0"
		persistent
		dark
	>
		<v-card color="rgba(0,0,0,0)" width="100%" dark flat outlined tile elevation="0">
			<v-btn class="place-up" absolute top right icon @click="closeDialog">
				<v-icon color="white" x-large>mdi-close-circle</v-icon>
			</v-btn>
			<LargeCarousel :items="items" :activeIndex="carouselIndex" />
		</v-card>
	</v-dialog>
</template>

<style scoped>
.responsive-dialog {
	width: 90% !important;
	height: 90% !important;
}

/deep/ .v-dialog {
	box-shadow: none !important;
}

.place-up {
	z-index: 999;
}
</style>
