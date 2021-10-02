<script>
export default {
	name: 'ProductForm-Content',
	props: {
		productModel: Object,
	},
	data() {
		return {
			product: this.productModel,
			attrKeys: [],
			attrKeysLoading: false,
			attrKeysLoaded: false,
		}
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
		addAttr() {
			let newAttr = { attrKey: {} }
			this.product.attrs.splice(this.product.attrs.length, 0, newAttr)
		},
		removeAttr(i) {
			this.product.attrs.splice(i, 1)
		},
		setProductDefaults() {
			this.$set(this.product, 'attrs', this.product.attrs || [])
			this.$set(this.product, 'info', this.product.info || {})
			this.$set(this.product, 'images', this.product.images || [])
			if (!this.product.attrs.length) this.addAttr()
		},
	},
	created() {
		this.setProductDefaults()
	},
}
</script>

<template>
	<cont>
		<row>
			<!-- IMAGES ------------------------------------------------>
			<c>
				<Subtitle text="Imágenes del producto" icon="mdi-image" />
			</c>
			<c>
				<MultiImageInputs v-model="product.images" src-prop="squareUrl" />
			</c>
			<!-- INFO ------------------------------------------------>
			<c>
				<Subtitle text="Info" />
			</c>
			<c>
				<Textarea v-model="product.info.description" label="Descripción" />
			</c>
			<!-- ATTRIBUTES ------------------------------------------>
			<c>
				<Subtitle text="Atributos" />
			</c>
			<c>
				<row v-for="(attr, i) of product.attrs" :key="attr.id">
					<c sm="4">
						<Combobox
							label="Atributo"
							placeholder="Buscar o crear..."
							v-model="attr.attrKey.k"
							dense
							:items="attrKeys.map((attrKey) => attrKey.k)"
							:loading="attrKeysLoading"
							@focus="loadAttrKeys"
						/>
					</c>
					<c xs="10" sm="4">
						<Combobox
							label="Valor"
							placeholder="Buscar o crear..."
							v-model="attr.v"
							dense
							:items="getAttrValues(attr.attrKey.k)"
							:loading="attrKeysLoading"
							@focus="loadAttrKeys"
						/>
					</c>
					<c
						xs="2"
						sm="4"
						class="d-flex align-center justify-end justify-sm-start"
					>
						<Button text small color="error" @click="removeAttr(i)">
							<v-icon>mdi-minus</v-icon>
							<span class="d-none d-sm-inline">Remover</span>
						</Button>
					</c>
					<c>
						<v-divider />
					</c>
				</row>
				<Button
					text
					color="success"
					small
					@click="addAttr"
					:class="{ 'mt-2': true, 'mt-6': product.attrs.length }"
				>
					<v-icon>mdi-plus</v-icon>
					Agregar
				</Button>
			</c>
		</row>
	</cont>
</template>
