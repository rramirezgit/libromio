<script>
import { BaseProductCard } from '@/site/autoloader'

export default {
	extends: BaseProductCard,
}
</script>

<template>
	<v-card hover flat tile :to="productRoute" class="elevation-1 product-card">
		<slot name="images" v-bind="{ mainImage, secondImage }">
			<ProductCardImage :mainImage="mainImage" :secondImage="secondImage" />
		</slot>
		<div class="px-2 py-5 d-flex outer-card-content mt-8">
			<div class="pa-5 pt-0 pb-0 card-content">
				<div class="flex-grow-1 primary--text">
					<div class="line-clamp-3 font-2 primary-dark-purple--text">
						{{ product.name }}
					</div>
					<div class="pt-1">
						<PriceLayout :prevPrice="prevPrice" :price="price" :discountPct="discountPct" />
					</div>
					<div class="primary-orange--text font-weight-bold mt-2">
						12 cuotas sin interés
					</div>
					<component v-for="name of afterPriceAddons" :is="name" :key="name" />
				</div>
			</div>
			<div class="outer-bubble">
				<div class="bubble"></div>
				<div class="bubble" style="left:64px"></div>
				<div class="bubble" style="left:191px"></div>
			</div>
		</div>
		<div class="wishlist-position">
			<ProductWishlistToggler :productId="product.id" />
		</div>
		<component v-for="name of absoluteAddons" :is="name" :key="name" />
	</v-card>
</template>

<style scoped>
.product-card {
	overflow: hidden;
}

.card-content {
	position: relative;
	z-index: 1;
}

.outer-card-content {
	background-color: #eff7fa;
	position: relative;
}

.wishlist-position {
	position: absolute;
	top: 5px;
	right: 5px;
}

.outer-bubble {
	position: absolute;
	width: 277px;
	top: -35px;
	left: calc(50% - 138.5px);
	z-index: 0;
}

.bubble {
	position: absolute;
	top: 0;
	left: 0;
	background-color: #eff7fa;
	width: 150px;
	height: 150px;
	border-radius: 50%;
	left: -59px;
}
</style>
