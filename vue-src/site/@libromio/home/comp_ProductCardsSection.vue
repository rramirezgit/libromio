<script>
export default {
	name: 'ProductCardsSection',
	props: {
		title: String,
		products: Array,
		ctaTxt: String,
		link: String,
	},
}
</script>

<template>
	<Container v-if="products" class="pa-0 mb-8 mt-16">
		<v-row>
			<v-col
				cols="12"
				v-if="title"
				class="text-center font-6 primary--text font-weight-bold mb-4 d-flex justify-center"
			>
				<div class="title-container">
					{{ title }}
				</div>
			</v-col>

			<v-col cols="12" sm="6" md="3" v-for="item in products" :key="item.id" class="mb-4 ">
				<ProductCard :product="item" />
			</v-col>
			<v-col cols="12" v-if="ctaTxt" class="d-flex justify-center">
				<v-btn large rounded class="white--text primary-red font-weight-bold pa-6 pt-8 pb-8">
					{{ ctaTxt }}
				</v-btn>
			</v-col>
		</v-row>
	</Container>
</template>

<style scoped>
.title-container {
	width: 100%;
	max-width: 500px;
}
</style>
