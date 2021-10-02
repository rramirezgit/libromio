<script>
import { compsFromContext } from '@/__shared/utils/lib_utils'
const addonsComponents = compsFromContext(require.context('@/site', true, /-ProductCard-Addon\.vue$/))

export default {
	name: 'ProductCard',
	props: {
		product: Object,
	},
	components: {
		...addonsComponents,
	},
	computed: {
		absoluteAddons() {
			return Object.entries(addonsComponents)
				.filter(([, comp]) => comp.addon.position == 'absolute')
				.map(([name]) => name)
		},
		afterPriceAddons() {
			return Object.entries(addonsComponents)
				.filter(([, comp]) => comp.addon.position == 'after-price')
				.map(([name]) => name)
		},
		productRoute() {
			return {
				name: 'product',
				params: { urlName: this.product.urlName, id: this.product.id },
			}
		},
		mainVariant() {
			return this.product.variants.find((variant) => variant.main) || this.product.variants[0]
		},
		prevPrice() {
			return this.mainVariant.pvPrice.prevPrice
		},
		price() {
			return this.mainVariant.pvPrice.price
		},
		discountPct() {
			return this.mainVariant.pvPrice.discountPct
		},
		mainImage() {
			return this.product.mainImage.mediumUrl
		},
		secondImage() {
			return this.product.secondImage && this.product.secondImage.mediumUrl
		},
	},
}
</script>

<template>
	<v-card hover flat tile :to="productRoute">
		<slot name="images" v-bind="{ mainImage, secondImage }">
			<ProductCardImage :mainImage="mainImage" :secondImage="secondImage" />
		</slot>
		<div class="px-2 py-5 d-flex">
			<div class="flex-grow-1">
				<div class="line-clamp-3 white text-body-1 primary--text">
					{{ product.name }}
				</div>
				<div class="pt-1">
					<PriceLayout :prevPrice="prevPrice" :price="price" :discountPct="discountPct" />
				</div>
				<component v-for="name of afterPriceAddons" :is="name" :key="name" />
			</div>
			<div class="pl-3">
				<ProductWishlistToggler :productId="product.id" />
			</div>
		</div>
		<component v-for="name of absoluteAddons" :is="name" :key="name" />
	</v-card>
</template>
