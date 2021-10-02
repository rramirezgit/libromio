<script>
export default {
	name: 'ProductsLayout',
	props: {
		products: Array,
		paginationProps: Object,
		loading: Boolean,
	},
	data() {
		return {
			page: 1,
		}
	},
	watch: {
		'paginationProps.value'(value) {
			this.page = value
		},
		page() {
			this.$emit('updatePage', this.page)
		},
	},
	created() {},
}
</script>

<template>
	<Container fluid>
		<v-row v-if="loading">
			<v-col cols="4" class="mb-10" v-for="i of Array(3).keys()" :key="i">
				<v-skeleton-loader type="card,paragraph" loading />
			</v-col>
		</v-row>
		<v-row v-else>
			<v-col cols="12" sm="4" class="mb-10" v-for="product in products" :key="product.id">
				<ProductCard :product="product" />
			</v-col>
			<v-col cols="12" class="pb-16" v-if="paginationProps">
				<div class="text-center">
					<v-pagination v-model="page" v-bind="paginationProps" />
				</div>
			</v-col>
		</v-row>
	</Container>
</template>
