<script>
import { get } from 'vuex-pathify'

export default {
	data() {
		return {
			loading: false,
			items: [],
		}
	},
	methods: {
		loadFavorites() {
			this.$shopApi.get({
				url: '/wishlist/products',
				loading: (v) => (this.loading = v),
				onSuccess: ({ data }) => {
					this.items = data.products
				},
			})
		},
	},
	computed: {
		wishlistIds: get('shop/wishlistIds'),
		wishlistItems() {
			return this.items.filter((item) => this.wishlistIds.includes(item.id))
		},
		noItems() {
			return this.wishlistItems.length < 1 && this.loading === false
		},
	},
	created() {
		this.loadFavorites()
	},
}
</script>

<template>
	<UserpanelLayout title="Mis Favoritos">
		<div v-if="noItems" class="text-center py-16">
			<v-icon x-large color="grey lighten-1">mdi-heart-broken</v-icon>
			<div class="font-weight-bold text-h5 mb-4">No tienes nada en favoritos</div>
			<div class="mb-6">Para comenzar a añadir puedes...</div>
			<div>
				<v-btn class="primary" x-large :to="{ name: 'shop', params: { filters: ['shop'] } }">
					IR A LA TIENDA
				</v-btn>
			</div>
		</div>
		<ProductsLayout :loading="loading" :products="wishlistItems" />
	</UserpanelLayout>
</template>

<style></style>
