<script>
export default {
	name: 'ProductsCarouselSection',
	props: {
		title: String,
		products: Array,
		ctaTxt: {
			type: String,
			default: 'sadas',
		},
		link: {
			type: String,
			default: '',
		},
	},
	computed: {
		showCta() {
			return this.ctaTxt && this.link
		},
		clickOut() {
			return this.link.split('')[0] == '/' ? true : false
		},
	},
}
</script>

<template>
	<Container class="pa-0 pt-16 pb-16">
		<div class="text-center title pb-8">
			<h2 class="text-h5 font-weight-bold extra-letter-spacing">
				{{ title }}
			</h2>
		</div>
		<div v-if="showCta" class="pb-8 d-flex justify-center">
			<v-btn v-if="clickOut" :to="link" class="primary--text" x-large tile outlined>
				{{ ctaTxt }}
			</v-btn>
			<v-btn v-else :href="link" class="primary--text" x-large tile outlined>
				{{ ctaTxt }}
			</v-btn>
		</div>
		<ProductsCarousel :products="products" />
	</Container>
</template>

<style scoped>
.extra-letter-spacing {
	letter-spacing: 0.062em !important;
}
</style>
