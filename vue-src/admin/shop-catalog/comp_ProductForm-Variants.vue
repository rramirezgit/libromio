<script>
export default {
	name: 'ProductForm-Variants',
	inject: ['showDialog', 'isNew', 'pricesConfigs'],
	props: {
		productModel: Object,
	},
	data() {
		return {
			product: this.productModel,
			attrKeys: [],
			attrKeysLoading: false,
			attrKeysLoaded: false,
			savedMultipleVariants: [],
			savedUniqueVariants: [{}],
			generatorOpts: [],
			mainVariantKey: null,
		}
	},
	watch: {
		'product.hasUniqueVariant'(newVal, oldVal) {
			if (oldVal === undefined) return
			if (newVal) {
				this.savedMultipleVariants = [...this.product.variants]
				this.replaceVariants(this.savedUniqueVariants)
			} else {
				this.savedUniqueVariants = [this.product.variants[0] || {}]
				this.replaceVariants(this.savedMultipleVariants)
			}
			this.setupGeneratorOpts()
		},
		mainVariantKey(newVal) {
			this.product.variants.forEach((variant) => (variant.main = variant._k == newVal))
		},
	},
	methods: {
		async loadAttrKeys() {
			if (this.attrKeysLoaded || this.attrKeysLoading) return
			await this.$adminApi.get({
				url: '/catalog/attr-keys',
				query: { scope: 'combobox' },
				loading: (v) => (this.attrKeysLoading = v),
				done: ({ data }) => {
					this.attrKeys = data.attrKeys || []
					this.attrKeysLoaded = true
				},
			})
		},
		getAttrValues(key) {
			if (!key) return []
			let attrKey = this.attrKeys.find((attr) => attr.k == key)
			return attrKey ? attrKey.values.map((attrVal) => attrVal.v) : []
		},
		setupGeneratorOpts() {
			if (this.product.hasUniqueVariant) {
				this.generatorOpts = []
				return
			}
			let opts = []
			let { variants } = this.product
			variants.sort((a, b) => a.position - b.position)

			for (let variant of variants) {
				let { attrs = [] } = variant
				for (let vAttr of attrs) {
					let k = vAttr.attrKey.k
					let v = vAttr.v
					let opt = opts.find((opt) => opt.k == k)
					if (!opt) {
						opt = { k, values: [] }
						opts.push(opt)
					}
					if (!opt.values.includes(v)) {
						opt.values.push(v)
					}
				}
			}
			if (!opts.length) opts.push({ k: '', values: [] })

			let { vAttrsPos } = this.product
			if (vAttrsPos) {
				opts.sort((a, b) => vAttrsPos.indexOf(a.k) - vAttrsPos.indexOf(b.k))
			}
			//opts.forEach((opt) => opt.values.sort())
			this.generatorOpts = opts
		},
		validateGeneratorOpts() {
			let genOptsKeys = []
			let errTitle = 'Error al generar variantes'
			for (let genOpt of this.generatorOpts) {
				if (!genOpt.k || !genOpt.values.length) {
					return this.showDialog({
						type: 'error',
						title: errTitle,
						text: 'Debes completar todas las opciones de variante',
					})
				}
				if (genOptsKeys.includes(genOpt.k.toLowerCase())) {
					return this.showDialog({
						type: 'error',
						title: errTitle,
						text: 'Revisa las opciones de variantes, no puedes ingresar la misma opción multiples veces.',
					})
				}
				genOptsKeys.push(genOpt.k.toLowerCase())
				let genOptValues = []
				for (let value of genOpt.values) {
					if (genOptValues.includes(value.toLowerCase())) {
						return this.showDialog({
							type: 'error',
							title: errTitle,
							text: `Hay valores repetidos en la opción "${genOpt.k}"`,
						})
					}
					genOptValues.push(value.toLowerCase())
				}
			}
			return true
		},
		generateVariants() {
			if (this.validateGeneratorOpts() !== true) return

			let combos = this.generatorOpts.length ? [[]] : []

			for (let genOpt of this.generatorOpts.slice().reverse()) {
				let newCombos = []
				for (let value of genOpt.values) {
					combos.forEach((combo) => {
						newCombos.push(combo.concat({ attrKey: { k: genOpt.k }, v: value }))
					})
				}
				combos = newCombos
			}
			combos.forEach((combo) => combo.reverse())

			let vAttrsPos = (this.product.vAttrsPos = this.generatorOpts.map((genOpt) => genOpt.k))
			this.product.variants.forEach((variant) => (variant.found = false))

			let orderedVariants = [...combos.entries()].map(([position, combo]) => {
				let foundVariants = this.product.variants.filter((variant) => {
					if (variant.attrs.length != combo.length || variant.found) {
						return false
					}
					for (let opt of combo) {
						let isAttr = !!variant.attrs.find((vAttr) => {
							return vAttr.attrKey.k == opt.attrKey.k && vAttr.v == opt.v
						})
						if (!isAttr) return false
					}
					variant.attrs.sort((a, b) => vAttrsPos.indexOf(a.attrKey.k) - vAttrsPos.indexOf(b.attrKey.k))
					variant.found = true
					return true
				})

				let variant = foundVariants.length ? foundVariants[0] : { attrs: combo, found: true }
				variant.position = position
				return variant
			})

			this.replaceVariants(orderedVariants)
		},
		replaceVariants(newVariants) {
			newVariants.forEach((variant) => (variant._k = this.getVariantKey(variant)))
			let mainVariant = newVariants.find((variant) => variant.main)
			this.mainVariantKey = mainVariant?._k || newVariants[0]?._k
			this.product.variants.splice(0, this.product.variants.length, ...newVariants)
		},
		getVariantKey(variant) {
			if (this.product.hasUniqueVariant) return 1
			return JSON.stringify(
				variant.attrs.map((vAttr) => ({
					v: vAttr.v,
					k: vAttr.attrKey.k,
				}))
			)
		},
		setProductDefaults() {
			let { hasUniqueVariant = true, variants = [], vAttrsPos = [] } = this.product
			if (hasUniqueVariant && !variants.length) variants.push({})
			this.$set(this.product, 'hasUniqueVariant', hasUniqueVariant)
			this.$set(this.product, 'variants', variants)
			this.$set(this.product, 'vAttrsPos', vAttrsPos)
		},
	},
	created() {
		this.setProductDefaults()
		if (this.product.hasUniqueVariant) {
			this.product.variants[0]._k = 1
		} else {
			this.setupGeneratorOpts()
			this.generateVariants()
		}
	},
}
</script>

<template>
	<div>
		<cont>
			<row>
				<c>
					<Subtitle text="Seleccioná el tipo de producto" />
					<v-radio-group v-model="product.hasUniqueVariant" hide-details>
						<v-radio label="Producto único" :value="true" />
						<v-radio label="Producto con múltiples variantes" :value="false" />
					</v-radio-group>
				</c>
			</row>

			<row v-show="!product.hasUniqueVariant">
				<c>
					<Subtitle text="Generador de variantes" />
				</c>
				<c>
					<row v-for="(genOpt, i) of generatorOpts" :key="i">
						<c sm="4">
							<Combobox
								label="Opción"
								placeholder="Seleccionar o crear..."
								dense
								:loading="attrKeysLoading"
								@focus="loadAttrKeys()"
								:items="attrKeys.map((attrKey) => attrKey.k)"
								v-model="genOpt.k"
							/>
						</c>
						<c xs="10" sm="4">
							<Combobox
								label="Valores"
								placeholder="Seleccionar o crear..."
								dense
								:loading="attrKeysLoading"
								@focus="loadAttrKeys()"
								multiple
								small-chips
								:items="getAttrValues(genOpt.k)"
								v-model="genOpt.values"
								:delimiters="[',']"
							/>
						</c>
						<c xs="2" sm="4" class="d-flex align-center justify-end justify-sm-start">
							<Button
								text
								small
								color="error"
								@click="generatorOpts.splice(i, 1)"
								:disabled="generatorOpts.length <= 1"
							>
								<v-icon>mdi-minus</v-icon>
								<span class="d-none d-sm-inline">Remover</span>
							</Button>
							<Button
								text
								small
								color="secondary"
								@click="generatorOpts.splice(i + 1, 0, generatorOpts.splice(i, 1)[0])"
								:disabled="i == generatorOpts.length - 1"
							>
								<v-icon>mdi-arrow-down</v-icon>
								<span class="d-none d-sm-inline">Mover</span>
							</Button>
						</c>
					</row>
				</c>
				<c>
					<v-divider />
				</c>
				<c class="d-flex align-center">
					<Button text color="success" small @click="generatorOpts.push({ k: '', values: [] })">
						<v-icon>mdi-plus</v-icon>
						Agregar opción
					</Button>
					<v-spacer />
					<Button color="primary" small @click="generateVariants">
						<v-icon>mdi-cog</v-icon>
						<span class="d-none d-sm-inline">Generar Variantes</span>
					</Button>
				</c>
			</row>

			<row v-if="product.variants.length">
				<c>
					<Subtitle :text="product.hasUniqueVariant ? 'Producto' : 'Variantes de Producto'" />
				</c>
				<c>
					<v-radio-group v-model="mainVariantKey">
						<row v-for="(variant, i) of product.variants" :key="variant._k">
							<c v-if="!product.hasUniqueVariant">
								<v-divider style="border: 2px solid var(--v-primary-base)" />
							</c>
							<c v-if="!product.hasUniqueVariant" class="d-flex align-center">
								<div class="d-inline-block rounded primary py-2 white--text">
									<div class="d-flex align-center">
										<div
											v-for="(vAttr, i) of variant.attrs"
											:key="vAttr.attrKey.k"
											:style="{ 'border-left': i == 0 ? '0px' : '1px solid #FFF' }"
											class="px-6"
										>
											<b>{{ vAttr.attrKey.k }}</b> {{ vAttr.v }}
										</div>
									</div>
								</div>
								<v-radio label="Principal" :value="variant._k" class="ml-4" />
								<v-spacer />
								<!-- <Button
									:text="!variant._editing"
									color="secondary"
									@click="$set(variant, '_editing', !variant._editing)"
								>
									<v-icon> mdi-chevron-{{ variant._editing ? 'down' : 'up' }} </v-icon> Editar
								</Button> -->
							</c>
							<!-- <c v-show="product.hasUniqueVariant || variant._editing"> -->
							<c>
								<ProductForm-Variants-Data
									:variant-model="variant"
									:product-model="product"
									:validator-key="`product.variant_${i}`"
								/>
							</c>
						</row>
					</v-radio-group>
				</c>
			</row>
		</cont>
	</div>
</template>
