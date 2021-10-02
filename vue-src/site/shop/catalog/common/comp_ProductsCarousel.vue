<script>
export default {
	name: 'ProductsCarousel',
	props: {
		products: Array,
	},
	data() {
		return {
			carouselValue: 0,
		}
	},
	created() {},
	computed: {
		cardsToShow() {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					return 1
				case 'sm':
					return 2
				default:
					return 4
			}
		},
		orderedGroups() {
			let itemVal = 0
			let tempAry = []
			let orderedGroups = []
			for (let [i, item] of this.products.entries()) {
				tempAry.push(item)
				itemVal++
				if (itemVal == this.cardsToShow || i == this.products.length - 1) {
					itemVal = 0
					orderedGroups.push(tempAry)
					tempAry = []
				}
			}
			return orderedGroups
		},
		showArrows() {
			return this.orderedGroups.length > 1
		},
	},

	methods: {
		arrowLeftClick() {
			this.carouselValue = this.carouselValue > 0 ? this.carouselValue - 1 : 0
		},
		arrowRightClick() {
			if (this.carouselValue < this.orderedGroups.length - 1) {
				this.carouselValue = this.carouselValue + 1
			}
		},
	},
}
</script>

<template>
	<div :class="`carousel-parent ${cardsToShow == 1 && 'carousel-small'}`">
		<div @click="arrowLeftClick" class="arrows-parent left-arrow">
			<v-icon x-large>
				mdi-chevron-left
			</v-icon>
		</div>
		<div @click="arrowRightClick" class="arrows-parent right-arrow">
			<v-icon x-large>
				mdi-chevron-right
			</v-icon>
		</div>
		<v-carousel
			continuous
			hide-delimiter-background
			hide-delimiters
			height="auto"
			:value="carouselValue"
			:show-arrows="false"
			light
		>
			<v-carousel-item v-for="(group, i) in orderedGroups" :key="i">
				<Container class="pa-0" fluid>
					<v-row>
						<v-col cols="12" sm="6" md="3" v-for="product of group" :key="product.id">
							<ProductCard :product="product" />
						</v-col>
					</v-row>
				</Container>
			</v-carousel-item>
		</v-carousel>
	</div>
</template>

<style scoped>
.carousel-parent {
	position: relative;
}

.carousel-small {
	display: block;
	max-width: 90%;
	margin: 0 auto;
}

.arrows-parent {
	position: absolute;
	width: 40px;
	height: 40px;
	top: calc(50% - 20px);
	cursor: pointer;
}

.left-arrow {
	left: -40px;
}

.right-arrow {
	left: 100%;
}
</style>
