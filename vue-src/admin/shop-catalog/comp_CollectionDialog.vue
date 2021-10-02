<script>
import itemDialogMixin from '@/admin/admin/mixin_item-dialog'
export default {
	name: 'CollectionDialog',
	mixins: [itemDialogMixin('collection')],
	data() {
		return {
			filterKey: 0,
		}
	},
	computed: {
		filtersTypes() {
			return [
				{
					text: 'Categoría',
					value: 'category',
					component: 'CategorySelector',
					operators: [
						{ text: 'Sea igual a', value: 'in' },
						{ text: 'Sea diferente a', value: 'not_in' },
					],
					attrs: (op) => ({
						multiple: true,
						smallChips: true,
						canCreate: false,
						label: `Categorías a ${op == 'in' ? 'INCLUIR' : 'EXCLUIR'}`,
					}),
				},
				{
					text: 'Tags / Etiquetas',
					value: 'tag',
					component: 'TagSelector',
					operators: [
						{ text: 'Tenga alguna', value: 'any' },
						{ text: 'Tenga todas', value: 'all' },
						{ text: 'No tenga alguna', value: 'not_any' },
						{ text: 'No tenga todas', value: 'not_all' },
					],
					attrs: (op) => ({
						multiple: true,
						returnProp: 'id',
						label: `Tags a ${op.startsWith('not') ? 'EXCLUIR' : 'INCLUIR'}`,
					}),
				},
				{
					text: 'Selección de productos',
					value: 'product',
					component: 'ProductSelector',
					operators: [
						{ text: 'A incluir', value: 'in' },
						{ text: 'A excluir', value: 'not_in' },
					],
					attrs: (op) => ({
						multiple: true,
						label: `Productos a ${op == 'in' ? 'INCLUIR' : 'EXCLUIR'}`,
					}),
				},
			]
		},
	},
	watch: {
		dialog(value) {
			if (value) this.setCollectionDefaults()
		},
	},
	methods: {
		setCollectionDefaults() {
			let filters = this.collection.filters || []
			if (!filters.length) filters.push({})
			filters.forEach((filter) => (filter.__key = this.filterKey++))
			this.$set(this.collection, 'filters', filters)
		},
		addFilter() {
			this.collection.filters.push({ __key: this.filterKey++ })
		},
		removeFilter(i) {
			this.collection.filters.splice(i, 1)
		},
		saveCollection() {
			let collection = { ...this.collection }
			collection.filters = collection.filters.map(({ type, op, val }) => ({
				type,
				op,
				val,
			}))

			let opts = {
				loading: (v) => (this.loading = v),
				onValidation: ({ validation }) => (this.validation = validation),
				data: { collection },
				successMessage: {
					title: 'Listo!',
					text: `La Colección se ha ${this.isNew ? 'creado' : 'guardado'} correctamente`,
				},
				onSuccess: ({ data }) => {
					this.dialog = false
					this.$emit('saved', data.collectionId)
				},
				clearCache: '/catalog/collection',
			}

			if (this.isNew) {
				this.$adminApi.post('/catalog/collection', opts)
			} else {
				this.$adminApi.put(`/catalog/collection/${this.collection.id}`, opts)
			}
		},
		deleteCollection() {
			this.$adminApi.delete({
				url: `/catalog/collection/${this.collection.id}`,
				loading: (v) => (this.loadingDelete = v),
				confirm: {
					title: `La Colección será eliminada`,
					text: `¿Desea continuar?`,
					accept: 'Sí, eliminar',
				},
				onSuccess: () => {
					this.dialog = false
					this.$emit('deleted')
				},
				clearCache: '/catalog/collection',
			})
		},
		getFilterTypeData(type) {
			return this.filtersTypes.find((data) => data.value == type)
		},
	},
}
</script>

<template>
	<ItemDialog
		v-model="dialog"
		:title-text="isNew ? 'Crear colección' : 'Editar colección'"
		:submit-text="isNew ? 'Crear' : 'Guardar'"
		:loading="loading"
		:deletable="!isNew"
		@delete="deleteCollection"
		:loading-delete="loadingDelete"
		@submit="saveCollection"
		max-width="900px"
	>
		<Validator :validation="validation">
			<cont>
				<row>
					<c>
						<TextField
							v-model="collection.keyname"
							label="Nombre de la colección"
							hint="Máx. 30 caracteres"
							persistent-hint
						/>
					</c>
					<c class="text-h6">
						Filtros de productos
					</c>
					<c>
						<row v-for="(filter, i) in collection.filters" :key="filter.__key">
							<c md="6">
								<Select
									v-model="filter.type"
									:items="filtersTypes"
									label="Filtrar por"
									dense
									:validator-key="`collection.filters.${i}.type`"
									@input="filter.val = null"
								/>
							</c>
							<c md="6" v-if="filter.type">
								<Select
									v-model="filter.op"
									:items="getFilterTypeData(filter.type).operators"
									label="Condición"
									dense
									:validator-key="`collection.filters.${i}.op`"
								/>
							</c>
							<c md="9" v-if="filter.type && filter.op">
								<component
									:is="getFilterTypeData(filter.type).component"
									v-model="filter.val"
									v-bind="getFilterTypeData(filter.type).attrs(filter.op)"
									:validator-key="`collection.filters.${i}.val`"
								/>
							</c>
							<c md="3">
								<v-btn
									small
									text
									color="error"
									@click="removeFilter(i)"
									:disabled="collection.filters.length == 1"
								>
									<v-icon>mdi-trash-can-outline</v-icon>
									Remover
								</v-btn>
							</c>
							<c>
								<v-divider />
							</c>
						</row>
						<row>
							<c>
								<v-btn small color="primary" text @click="addFilter">
									<v-icon>mdi-plus</v-icon>
									Agregar filtro
								</v-btn>
							</c>
						</row>
					</c>
				</row>
			</cont>
		</Validator>
	</ItemDialog>
</template>
