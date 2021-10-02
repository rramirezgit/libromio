<script>
export default {
	name: 'CartItem',
	props: {
		item: Object,
	},
	data() {
		return {
			itemQty: this.item.qty,
			qtyInputLoading: false,
			deleteLoading: false,
		}
	},
	computed: {
		isMobile() {
			return this.$vuetify.breakpoint.xs
		},
		itemRoute() {
			if (this.item.refType == 'product') {
				let { urlName, productId: id, variantId: variant } = this.item.cartData
				let route = { name: 'product', params: { urlName, id } }
				if (variant) route.query = { variant }
				return route
			}
			return null
		},
		imageSize() {
			return this.isMobile ? 80 : 90
		},
		showQtyInput() {
			return this.item.type == 'physical'
		},
	},
	watch: {
		itemQty() {
			this.updateItem()
		},
	},
	methods: {
		deleteItem() {
			this.$shopApi.delete({
				url: '/cart/item',
				data: {
					type: 'product',
					id: this.item.refId,
				},
				loading: (v) => (this.deleteLoading = v),
				onSuccess: ({ data }) => {
					this.$store.set('cart/order', data.order)
				},
			})
		},
		updateItem() {
			this.$shopApi.put({
				url: '/cart/item',
				data: {
					type: 'product',
					id: this.item.refId,
					qty: this.itemQty,
				},
				loading: (v) => (this.qtyInputLoading = v),
				onSuccess: ({ data }) => {
					this.$store.set('cart/order', data.order)
				},
			})
		},
		hideCartDrawer() {
			this.$store.set('shop/cartDrawer', false)
		},
		gotoItem() {
			this.hideCartDrawer()
			this.$router.push(this.itemRoute)
		},
	},
}
</script>

<template>
	<div class="d-block d-sm-flex align-start flex-wrap flex-sm-nowrap is-relative">
		<div @click="gotoItem" class="mr-4">
			<img
				:src="item.image"
				class="rounded d-block"
				:style="{ width: imageSize + 'px', height: imageSize + '%' }"
				style="border: 1px solid #ddd; cursor: pointer"
				@click="gotoItem"
			/>
		</div>

		<div class="flex-shrink-1">
			<div @click="gotoItem" style="cursor: pointer">
				{{ item.name }}
			</div>
			<div class="grey--text" @click="hideCartDrawer" v-if="item.variantName">
				{{ item.variantName }}
			</div>
			<PriceLayout
				class="mt-2"
				:prevPrice="item.initPrice"
				:price="item.price"
				:discountPct="item.discountPct"
			/>
		</div>
		<v-spacer />
		<div class="d-flex align-end flex-column ml-4 mt-3 mt-sm-0">
			<QtyInput
				v-model="itemQty"
				:loading="qtyInputLoading"
				class="mb-3"
				:max-qty="item.cartData.maxQty"
				:metric="item.unitMetric"
				v-if="showQtyInput"
			/>
			<v-btn
				icon
				color="error"
				@click="deleteItem"
				:absolute="isMobile"
				:top="isMobile"
				:right="isMobile"
				:loading="deleteLoading"
			>
				<v-icon>mdi-cart-remove</v-icon>
			</v-btn>
		</div>
	</div>
</template>

<style scoped>
.is-relative {
	position: relative;
}

.min-width {
	min-width: 167px;
}

.full-width {
	width: 100%;
}
</style>
