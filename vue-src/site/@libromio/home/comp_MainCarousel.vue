<script>
export default {
	name: 'MainCarousel',
	data() {
		return {
			items: this.$srv('HomeSliders', []),
		}
	},
	methods: {
		imgToShow(item) {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					return item.imgMobile
				default:
					return item.img
			}
		},
	},
	computed: {
		ratio() {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					return 0.65
				default:
					return 2.32
			}
		},
	},
}
</script>

<template>
	<Container fluid class="pa-0 primary-pink is-relative is-main-raousel-parent">
		<Container class="pa-0 is-main-carousel">
			<v-carousel hide-delimiters cycle light height="auto">
				<div v-for="(item, i) in items" :key="i">
					<v-carousel-item :aspect-ratio="ratio" :to="item.link" :src="imgToShow(item)" contain />
				</div>
			</v-carousel>
		</Container>
		<div class="bubble white" style="left:calc(50% - 1079px)"></div>
		<div class="bubble white below-bubble" style="left:calc(50% - 879px);"></div>
		<div class="bubble white" style="left:calc(50% - 649px)"></div>
		<div class="bubble white above-bubble" style="left:calc(50% + 460px);"></div>
		<div class="bubble white" style="left:calc(50% + 726px);"></div>
		<div class="bubble white below-bubble" style="left:calc(50% + 950px);"></div>
	</Container>
</template>

<style scoped>
.top-index {
	position: relative;
	z-index: 2;
}

.is-main-carousel {
	position: relative;
	z-index: 1;
}

.is-main-raousel-parent {
	overflow: hidden;
}

.bubble {
	width: 300px;
	height: 300px;
	border-radius: 50%;
	position: absolute;
	bottom: -160px;
	left: 0;
	z-index: 0;
}
.below-bubble {
	bottom: -200px;
}
.above-bubble {
	bottom: -81px;
}
</style>
