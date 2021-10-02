<script>
export default {
	props: {
		activeIndex: Number,
		light: Boolean,
		items: Array,
		carouselHeight: {
			type: String,
			default: '89.7vh',
		},
	},
	data() {
		return {
			showDialog: false,
			carouselIndex: 0,
		}
	},
	created() {
		if (this.activeIndex) {
			this.carouselIndex = this.activeIndex
		}
	},
	watch: {
		activeIndex() {
			this.carouselIndex = this.activeIndex
		},
	},
	methods: {
		handleThumbClick(i) {
			this.updateActiveSlide(i)
			if (this.items.length > 4 && i >= 3) {
				this.openDialog()
			}
		},
		updateActiveSlide(i) {
			this.carouselIndex = i
		},
		openDialog() {
			this.showDialog = true
		},
		showOverlay(i) {
			return i == 3 && this.items.length > 4
		},
		closeDialog() {
			this.showDialog = false
		},
		showBorder(i) {
			return this.activeIndex == i ? 'thumb-active-border' : ''
		},
	},
	computed: {
		showArrows() {
			return this.items.length > 1
		},
	},
}
</script>

<template>
	<div>
		<v-carousel
			v-model="carouselIndex"
			class="responsive-dialog"
			:height="carouselHeight"
			:show-arrows="showArrows"
			:light="light"
		>
			<v-carousel-item v-for="(item, i) in items" :key="i">
				<div class="outer-img-cont">
					<v-img :src="item.bigUrl" height="100%" contain />
				</div>
			</v-carousel-item>
		</v-carousel>
	</div>
</template>

<style scoped>
.outer-img-cont {
	display: flex;
	width: 100%;
	height: 100%;
}
</style>
