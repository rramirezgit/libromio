<script>
import { get } from 'vuex-pathify'
export default {
	name: 'ProductForm',
	data() {
		return {
			loading: false,
			submitLoading: false,
			currentTabItem: 'tab-general',
			product: {},
			validation: {},
			pricesConfigs: [],
			hasError: false,
		}
	},
	computed: {
		routeId: get('route@params.id'),
		isNew() {
			return this.routeId == 'new'
		},
		submitText() {
			return this.hasError
				? 'Revisa los campos con error'
				: this.isNew
				? 'Crear producto'
				: 'Guardar producto'
		},
		submitColor() {
			return this.hasError ? 'error' : 'success'
		},
	},
	watch: {
		routeId() {
			this.loadData()
		},
	},
	methods: {
		async loadData() {
			let appTitle = this.isNew ? 'Nuevo producto' : 'Editar producto'
			this.$store.set('app/title', appTitle)

			if (!this.isNew) {
				await this.$adminApi.get({
					url: `/catalog/products/${this.routeId}`,
					loading: (v) => v && (this.loading = v),
					onSuccess: ({ data }) => {
						this.product = data.product
						this.$emit('productLoaded', { isNew: false, product: this.product })
					},
				})
			}
			await this.$adminApi.get({
				url: `/catalog/price-config`,
				//query: { editable: true },
				loading: (v) => (this.loading = v),
				onSuccess: ({ data }) => {
					this.pricesConfigs.splice(0, 0, ...data.pricesConfigs)
				},
			})
		},
		async save() {
			if (this.hasError) return
			let product = { ...this.product }
			delete product.categories
			delete product.brand
			let data = { product }
			let files = {}
			let { images = [] } = this.product
			images.forEach((image) => {
				files[`image_${image.pos}`] = image.file
			})
			let { variants = [] } = this.product
			variants.forEach((variant, i) => {
				if (variant.type == 'digital' && variant.digitalFile) {
					files[`digitalFile_${i}`] = variant.digitalFile
				}
			})

			let opts = {
				loading: (v) => (this.submitLoading = v),
				data,
				files,
				successMessage: {
					title: 'Listo!',
					text: `El producto se ha ${this.isNew ? 'creado' : 'guardado'} correctamente`,
				},
				onValidation: ({ validation }) => (this.validation = validation),
				onSuccess: ({ data }) => {
					if (this.isNew) {
						this.$router.push({
							name: 'products.single',
							params: { id: data.productId },
						})
					} else {
						this.loadData()
					}
				},
				done: ({ success }) => {
					this.hasError = !success
					setTimeout(() => (this.hasError = false), 3000)
				},
			}

			if (this.isNew) {
				await this.$adminApi.post('/catalog/products', opts)
			} else {
				await this.$adminApi.put(`/catalog/products/${this.product.id}`, opts)
			}
		},
		getMetric(type, q) {
			let plural = typeof q == 'boolean' ? q : q != 1
			let metric = this.product[`${type}Metric`]
			if (!metric) return ''
			metric = metric.split('/')
			return metric[0] + ((plural && metric[1]) || '')
		},
	},
	provide() {
		return {
			getMetric: this.getMetric,
			isNew: this.isNew,
			pricesConfigs: this.pricesConfigs,
		}
	},
	async created() {
		this.loadData()
	},
}
</script>

<template>
	<div>
		<div v-if="loading" class="text-center">
			<div class="text-h6 py-10">Cargando producto</div>
			<v-progress-circular indeterminate color="primary" size="48" />
		</div>
		<template v-else>
			<Tabs v-model="currentTabItem" class="mb-8">
				<v-tab href="#tab-general">General</v-tab>
				<v-tab href="#tab-content">Contenido</v-tab>
				<v-tab href="#tab-variants">Variantes</v-tab>
				<v-tab href="#tab-publication">Publicación</v-tab>
			</Tabs>
			<Validator :validation="validation">
				<TabsItems v-model="currentTabItem" class="mb-12" touchless>
					<v-tab-item value="tab-general">
						<ProductForm-General :product-model="product" />
					</v-tab-item>
					<v-tab-item value="tab-content">
						<ProductForm-Content :product-model="product" />
					</v-tab-item>
					<v-tab-item value="tab-variants">
						<ProductForm-Variants :product-model="product" />
					</v-tab-item>
					<v-tab-item value="tab-publication">
						<ProductForm-Publication :product-model="product" />
					</v-tab-item>
				</TabsItems>
			</Validator>
			<div class="bottom-nav py-2 px-4 elevation-4">
				<Button :color="submitColor" text @click="save" :loading="submitLoading">
					{{ submitText }}
				</Button>
			</div>
		</template>
	</div>
</template>

<style scoped>
.bottom-nav {
	position: fixed;
	bottom: 0;
	right: 0;
	background: #fff;
	width: 100%;
	display: flex;
	justify-content: flex-end;
}
</style>
