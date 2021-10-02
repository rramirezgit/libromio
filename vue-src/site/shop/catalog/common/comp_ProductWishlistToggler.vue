<script>
import { sync } from 'vuex-pathify'
export default {
	name: 'ProductWishlistToggler',
	props: {
		productId: String,
	},
	computed: {
		wishlistIds: sync('shop/wishlistIds'),
		inWishlist: {
			get() {
				return this.wishlistIds.includes(this.productId)
			},
			set(val) {
				if (val) {
					this.wishlistIds = this.wishlistIds.concat(this.productId)
				} else {
					this.wishlistIds = this.wishlistIds.filter((id) => id !== this.productId)
				}
			},
		},
		icon() {
			return this.inWishlist ? 'mdi-heart' : 'mdi-heart-outline'
		},
	},
	methods: {
		toggleWishlist() {
			if (!this.$store.get('shop/user')) {
				this.$store.set('shop/loginDrawer', true)
				return
			}
			this.inWishlist = !this.inWishlist
			let action = this.inWishlist ? 'add' : 'remove'
			this.$shopApi.post({
				url: `/wishlist/${action}/${this.productId}`,
			})
		},
	},
}
</script>

<template>
	<v-btn @click.stop.prevent="toggleWishlist" color="primary" icon small>
		<v-icon>{{ icon }}</v-icon>
	</v-btn>
</template>
