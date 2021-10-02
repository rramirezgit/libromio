<script>
export default {
	props: {
		imgIndex: Number,
		activeIndex: Number,
		item: Object,
		totalItems: Number,
	},
	data() {
		return {
			showDialog: false,
			carouselIndex: 0,
		}
	},
	computed: {
		active() {
			return this.activeIndex == this.imgIndex || (this.imgIndex == 3 && this.activeIndex > 3)
		},
	},
}
</script>

<template>
	<v-img
		v-on="$listeners"
		:src="item.squareUrl"
		width="96"
		aspect-ratio="1"
		class="thumb-img rounded"
		:class="{ active }"
	>
		<v-overlay absolute v-if="imgIndex == 3" opacity=".8">
			<div class="text-h3">+ {{ totalItems - 3 }}</div>
		</v-overlay>
	</v-img>
</template>

<style scoped>
.thumb-img {
	cursor: pointer;
	border: 1.5px solid #aaa;
}
.thumb-img.active {
	border: 1.5px solid #444;
}
</style>
