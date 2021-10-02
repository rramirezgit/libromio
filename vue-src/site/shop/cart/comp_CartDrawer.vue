<script>
import { get, sync } from 'vuex-pathify'
export default {
	name: 'CartDrawer',
	data() {
		return {
			cartKey: 0,
		}
	},
	computed: {
		cartDrawer: sync('shop/cartDrawer'),
		order: get('cart/order'),
		items() {
			return this.order && this.order.items
		},
		isCartEmpty() {
			return !this.items || !this.items.length
		},
	},
	watch: {
		items() {
			this.cartKey += 1
		},
	},
	methods: {
		drawerDragFix(e) {
			if (this.$vuetify.breakpoint.mdAndUp) return
			if (e.propertyName == 'visibility') {
				this.cartDrawer = e.target.classList.contains('v-navigation-drawer--open')
			}
		},
	},
}
</script>

<template>
	<v-navigation-drawer
		v-model="cartDrawer"
		class="pa-4"
		right
		fixed
		width="700"
		max-width="100%"
		overlay-color="#000"
		temporary
		:overlay-opacity="0.8"
		@transitionend="drawerDragFix"
	>
		<v-list-item class="px-2">
			<div class="font-weight-bold text-h5">
				<v-icon> </v-icon>
				CARRITO
			</div>
			<v-spacer></v-spacer>
			<v-btn :ripple="false" plain text @click="cartDrawer = false">
				<v-icon x-large>mdi-close-circle</v-icon>
			</v-btn>
		</v-list-item>
		<v-divider></v-divider>
		<v-list-item v-if="isCartEmpty" class="pt-4 d-flex justify-center">
			<div class="text-center font-weight-bold">
				NO HAY PRODUCTOS EN EL CARRITO
			</div>
		</v-list-item>
		<template v-else>
			<div class="px-sm-10" v-for="(item, i) of items" :key="`${cartKey}-${item.id}`">
				<CartItem :item="item" class="py-6" />
				<v-divider v-if="i < items.length - 1" />
			</div>
			<div class="px-sm-10 pb-4">
				<CartTotals :order="order" />
			</div>
		</template>
		<v-list-item class="justify-center mb-4">
			<v-btn class="primary" :disabled="isCartEmpty" x-large tile :to="{ name: 'checkout' }">
				FINALIZAR COMPRA
			</v-btn>
		</v-list-item>
		<v-list-item class="justify-center">
			<v-btn class="mt-2" text color="link" :to="{ name: 'shop', params: { filters: ['shop'] } }">
				SEGUIR COMPRANDO
			</v-btn>
		</v-list-item>
	</v-navigation-drawer>
</template>
