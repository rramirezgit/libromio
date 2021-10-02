<script>
import { get } from 'vuex-pathify'

export default {
	metaInfo() {
		let title = this.pageLoading || !this.product ? '...' : this.product.name
		let description = this.pageLoading || !this.product ? null : this.product.info?.description || title
		return { title, meta: [{ vmid: 'd', name: 'description', content: description }] }
	},
	data() {
		return {
			product: {},
			relatedProducts: [],
			productLoading: true,
			variantLoading: true,
			selectedVariantId: null,
			selectedVariant: null,
		}
	},
	computed: {
		routeParams: get('route@params'),
		routeVariantId: get('route@query.variant'),
		pageLoading() {
			return this.productLoading || !this.selectedVariant
		},
	},
	watch: {
		'routeParams.id'() {
			this.loadData()
		},
		selectedVariantId(value) {
			this.selectVariant(value)
		},
	},
	methods: {
		loadData() {
			let { id, urlName } = this.routeParams
			this.selectedVariant = null
			this.$shopApi.get({
				loading: (v) => (this.productLoading = v),
				url: `/catalog/product/${id}`,
				onSuccess: ({ data, options }) => {
					let { product } = data
					if (!product) {
						//404
						return
					}
					if (product.urlName != urlName) {
						options.abort()
						this.$router.replace({
							name: 'product',
							params: { id, urlName: product.urlName },
						})
					} else {
						this.product = data.product
						this.relatedProducts = data.relatedProducts
						this.selectVariant(this.routeVariantId)
					}
				},
			})
		},
		selectVariant(variantId) {
			if (variantId && variantId == this.selectedVariant?.id) return

			let variant = null
			let isDefaultVariant = false
			if (variantId) variant = this.product.variants.find((variant) => variant.id == variantId)
			if (!variant) {
				isDefaultVariant = true
				variant = this.product.variants.find((variant) => variant.main)
				if (!variant) variant = this.product.variants[0]
			}

			this.variantLoading = true
			let fn = () => {
				if (this.routeVariantId != variant.id) {
					if (isDefaultVariant && this.routeVariantId) {
						this.$router.replace({ query: { variant: undefined }, params: { savePosition: true } })
					} else if (this.selectedVariant || this.routeVariantId) {
						this.$router.replace({ query: { variant: variant.id }, params: { savePosition: true } })
					}
				}

				this.selectedVariant = variant
				this.selectedVariantId = variant.id
				this.variantLoading = false
			}

			if (!this.selectedVariant) fn()
			else setTimeout(fn, 500)
		},
	},
	created() {
		this.loadData()
	},
}
</script>

<template>
	<Container class="mt-0 mt-sm-8">
		<v-row class="pa-4">
			<v-col cols="12" md="6" class="pa-0">
				<v-skeleton-loader v-if="pageLoading" type="image" loading />
				<ProductImagesCarousel v-else :items="product.images" show-img-thumbs light />
			</v-col>
			<v-col cols="12" md="5" lg="6" class="pa-0">
				<v-skeleton-loader type="article" loading v-if="pageLoading" />
				<div class="pt-8 pt-md-0 pl-md-10" v-else>
					<v-row>
						<v-col cols="10">
							<div class="text-h4 font-weight-bold">
								{{ product.name }}
							</div>
							<SkuChip :sku="selectedVariant.sku" class="mt-2" />
						</v-col>
						<v-col cols="2" class="text-right">
							<ProductWishlistToggler :productId="product.id" :heartWidth="25" class="mr-3 mt-1" />
						</v-col>
					</v-row>
					<v-row>
						<v-col cols="12">
							<div style="position: relative">
								<v-overlay :value="variantLoading" color="#ffffff" absolute>
									<v-progress-circular indeterminate size="64" color="primary" />
								</v-overlay>
								<ProductVariantsSelector
									v-if="!product.hasUniqueVariant"
									v-model="selectedVariantId"
									:product="product"
									class="pb-3"
								/>
								<PriceLayout
									:prev-price="selectedVariant.pvPrice.prevPrice"
									:price="selectedVariant.pvPrice.price"
									:discount-pct="selectedVariant.pvPrice.discountPct"
									price-class="font-8"
									class="pb-3"
								/>
								<div class="py-2 font-1">
									<ProductStockAvailabilityMessage :stock="selectedVariant.stock" class="py-1" />
									<div class="d-flex align-center py-1" v-if="selectedVariant.type == 'digital'">
										<v-icon class="mr-2">mdi-cloud-download</v-icon>
										Producto digital descargable
									</div>
								</div>
								<ProductActions
									:selectedVariant="selectedVariant"
									:unitMetric="product.unitMetric"
									:priceMetric="product.priceMetric"
									class="py-3"
								/>
							</div>
							<DescriptionBox
								v-if="product.info && product.info.description"
								:descriptionTxt="product.info.description"
							/>
						</v-col>
					</v-row>
				</div>
			</v-col>
		</v-row>
		<template v-if="!pageLoading">
			<v-divider v-if="product.attrs.length" class="mt-8" />
			<v-row v-if="product.attrs.length">
				<v-col cols="12" class="pt-12 pb-12">
					<div class="text-h4 font-weight-bold">Características</div>
					<div class="mt-4">
						<div v-for="(item, i) of product.attrs" :key="i" class="pa-0 ma-0">
							<div>
								<span class="font-weight-bold"> {{ item.attrKey.k.toUpperCase() }}: </span>
								<span>
									{{ item.v }}
								</span>
							</div>
						</div>
					</div>
				</v-col>
			</v-row>
		</template>
		<ProductsCarouselSection
			v-if="!pageLoading && relatedProducts.length"
			:products="relatedProducts"
			title="TAMBIÉN TE PUEDE INTERESAR"
		/>
	</Container>
</template>
