<script>
export default {
	name: 'SummaryItem',
	props: {
		order: Object,
		item: Object,
	},
	computed: {
		metricWord() {
			let spl = this.item.unitMetric.split('/')
			return this.item.qty == 1 ? spl[0] : spl.join('')
		},
		isMobile() {
			return this.$vuetify.breakpoint.xs
		},
	},
}
</script>

<template>
	<div class="d-flex align-start">
		<div class="item-image-cont">
			<img :src="item.image" class="rounded item-image" />
		</div>
		<div class="flex-shrink-1 px-3 pl-1 pr-1 pl-sm-4 pr-sm-4">
			<div class="primary--text line-clamp-2">
				{{ item.name }}
			</div>
			<div v-if="item.variantName" class="text--secondary">
				{{ item.variantName }}
			</div>
			<SkuChip :sku="item.sku" />
			<div class="d-flex flex-nowrap align-center mt-2">
				<ProductPrevPrice class="mr-2" :amount="item.initPrice" v-if="item.discount" />
				<ProductPrice :amount="item.price" />
			</div>
			<div class="text-body-2 pt-1" v-if="item.discount">
				<span>{{ item.discountName }} </span>
				<ProductDiscount :amount="item.discountPct" />
			</div>
		</div>
		<v-spacer />
		<div :class="`${isMobile && 'mobile-totals mt-3'} text-no-wrap text-right`">
			<h2><PriceText :amount="item.total" :class="`${isMobile && 'font-1'}`" /></h2>
			<div class="text-caption">{{ item.qty }} {{ metricWord }}</div>
			<div class="success lighten-5 px-2 py-1 rounded text-center mt-2" v-if="item.reachedByOrderDiscount">
				<small>{{ order.discount.discountName }}</small>
				<br />
				<v-icon small class="star-icon">mdi-star</v-icon>
				<PriceText class="success--text font-weight-bold" :amount="-item.orderDiscountTotal" />
			</div>
		</div>
	</div>
</template>

<style scoped>
.star-icon {
	position: relative;
	top: -2px;
	margin-right: 1px;
}
.item-image {
	width: 70px;
	height: 70px;
	border: 1px solid #ddd;
}
.item-image-cont {
	width: 70px;
}
.mobile-totals {
	width: 100%;
	display: flex;
	flex-flow: column;
	justify-content: center;
	align-items: center;
}
</style>
