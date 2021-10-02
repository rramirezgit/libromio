<script>
export default {
	name: 'DefaultProducts',
	data() {
		return {
			defaultProducts: this.$srv('NoProducts'),
		}
	},
	created() {
		console.log(this.defaultProducts)
	},
	computed: {
		showCta() {
			return this.defaultProducts.ctaTxt && this.defaultProducts.link
		},
		clickOut() {
			return this.defaultProducts.link.split('')[0] == '/' ? true : false
		},
	},
}
</script>

<template>
	<div>
		<Container>
			<v-row>
				<v-col cols="12" class="text-center mb-8">
					<v-icon x-large class="primary--text">
						mdi-thumb-down-outline
					</v-icon>
					<div class="text-h3 mt-3">Ups! Lo sentimos...</div>
					<div class="mt-4">
						<p>No encontramos productos con stock disponible para tu búsqueda.</p>
					</div>
				</v-col>
			</v-row>
			<v-divider></v-divider>
			<v-row>
				<v-col cols="12">
					<div class="mt-10">
						<div class="text-center title pb-8">
							<h2 class="text-h5 font-weight-bold extra-letter-spacing">
								{{ defaultProducts.title }}
							</h2>
						</div>
						<div v-if="showCta" class="pb-8 d-flex justify-center">
							<v-btn v-if="clickOut" :to="link" class="primary--text" x-large tile outlined>
								{{ defaultProducts.ctaTxt }}
							</v-btn>
							<v-btn v-else :href="link" class="primary--text" x-large tile outlined>
								{{ defaultProducts.ctaTxt }}
							</v-btn>
						</div>
						<ProductsLayout :loading="false" :products="defaultProducts.products" />
					</div>
				</v-col>
			</v-row>
		</Container>
	</div>
</template>
