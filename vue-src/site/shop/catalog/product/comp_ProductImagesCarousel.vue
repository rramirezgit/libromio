<script>
export default {
	props: {
		activeIndex: Number,
		showImgThumbs: Boolean,
		light: Boolean,
		items: Array,
		clickable: {
			type: Boolean,
			default: true,
		},
		imgType: {
			type: String,
			default: 'medium',
		},
	},
	data() {
		return {
			showDialog: false,
			carouselIndex: 0,
		}
	},
	watch: {
		activeIndex() {
			this.carouselIndex = this.activeIndex
		},
	},
	methods: {
		handleImageClick() {
			if (this.clickable) {
				this.openDialog()
			}
		},
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
	created() {
		if (this.activeIndex) {
			this.carouselIndex = this.activeIndex
		}
		console.log(this.items)
	},
}
</script>

<template>
	<div>
		<div class="d-flex">
			<div class="d-none d-sm-flex flex-column flex-shrink-1 mr-4" v-if="showImgThumbs">
				<div v-for="(item, i) in items.slice(0, 4)" :key="item.src">
					<ThumbImg
						class="mb-4"
						@click="handleThumbClick(i)"
						:item="item"
						:img-index="i"
						:active-index="carouselIndex"
						:total-items="items.length"
					/>
				</div>
			</div>
			<v-carousel
				v-model="carouselIndex"
				class="responsive-dialog"
				height="auto"
				:show-arrows="showArrows"
				:hide-delimiters="showImgThumbs"
				:light="light"
			>
				<v-carousel-item v-for="(item, i) in items" :key="i">
					<RatioImage :src="item[`${imgType}Url`]" @click="handleImageClick(i)" />
				</v-carousel-item>
			</v-carousel>
		</div>
		<ProductImagesDialog
			:items="items"
			:showDialog="showDialog"
			:carouselIndex="carouselIndex"
			@closeDialog="closeDialog"
		/>
	</div>
</template>

<style scoped>
/deep/ .v-text-field {
	max-width: 60px !important;
}
</style>
