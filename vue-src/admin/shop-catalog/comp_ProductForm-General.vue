<script>
export default {
	name: 'ProductForm-General',
	props: {
		productModel: Object,
	},
	data() {
		return {
			product: this.productModel,
		}
	},
	methods: {
		setProductDefaults() {
			this.$set(this.product, 'unitMetric', this.product.unitMetric || 'unidad/es')
			this.$set(this.product, 'relevance', this.product.relevance || 0)
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
			<c>
				<Subtitle text="Información principal" />
			</c>
			<c md="8">
				<TextField v-model="product.name" label="Nombre" />
			</c>
			<c md="4">
				<BrandsSelector v-model="product.brandId" clearable />
			</c>
			<c>
				<CategorySelector
					label="Categoría"
					v-model="product.categoryId"
					only-bottom-categories
					clearable
					can-create
				/>
			</c>
			<c>
				<Subtitle text="Métricas" />
			</c>
			<c md="5">
				<Combobox
					label="Métrica de unidad"
					v-model="product.unitMetric"
					placeholder="Buscar o crear..."
					hint="Separar plural con /. Ej: unidad/es"
					persistent-hint
					:items="['unidad/es', 'caja/s', 'pallet/s']"
				/>
			</c>
			<c md="5">
				<Combobox
					label="Métrica de precio"
					v-model="product.priceMetric"
					placeholder="Buscar o crear..."
					hint="Separar plural con /. Ej: litro/s"
					persistent-hint
					:items="['m2', 'litro/s', 'kg/s']"
				/>
			</c>
			<c>
				<Subtitle text="Listados" />
			</c>
			<c md="8">
				<Combobox
					label="Palabras adicionales de búsqueda"
					v-model="product.keywords"
					placeholder="Agregar palabras..."
					hint="Separar palabras con espacios o enter. Ingresá palabras nuevas que no estén dentro del nombre ni la descripción del producto."
					persistent-hint
					hide-selected
					multiple
					small-chips
					:delimiters="[' ']"
				/>
			</c>
			<c md="4">
				<TextField
					label="Relevancia"
					type="number"
					v-model="product.relevance"
					persistent-hint
					hint="Número que se utiliza para posicionar el producto en los listados. Un producto con mayor relevancia se mostrará primero."
				/>
			</c>
			<c>
				<Subtitle text="Tags" />
			</c>
			<c>
				<TagSelector v-model="product.tags" can-create multiple />
			</c>
		</row>
	</cont>
</template>
