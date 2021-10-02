<script>
export default {
	name: 'RatioImage',
	props: {
		src: String,
		alt: String,
		width: [String, Number],
		maxWidth: [String, Number],
		aspectRatio: {
			type: [String, Number],
			default: 1,
		},
	},
	computed: {
		ratioPct() {
			return this.aspectRatio * 100
		},
		wider() {
			return this.$refs.image?.width && this.$refs.image.width >= this.$refs.image.height
		},
	},
	methods: {
		sizeVal(num) {
			if (!num) return null
			return isNaN(num) ? num : `${num}px`
		},
	},
	mounted() {
		let img = this.$refs.image
		img.onload = () => {
			console.log(img.width)
		}
	},
}
</script>

<template>
	<div
		class="sizer-container"
		:style="{
			width: sizeVal(width),
			maxWidth: sizeVal(maxWidth),
		}"
		v-on="$listeners"
		v-bind="$attrs"
		ref="cont"
	>
		<div class="sizer-elm" :style="{ paddingBottom: `${ratioPct}%` }"></div>
		<img :alt="alt" :src="src" ref="image" :class="{ wider: wider, taller: !wider }" />
	</div>
</template>

<style scoped>
.sizer-container {
	width: 100%;
	position: relative;
}
.sizer-elm {
	z-index: -1;
	pointer-events: none;
}
img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
img.wider {
	width: 100%;
	height: auto;
}
img.taller {
	width: auto;
	height: 100%;
}
</style>
