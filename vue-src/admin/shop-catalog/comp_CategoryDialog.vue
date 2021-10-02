<script>
import itemDialogMixin from '@/admin/admin/mixin_item-dialog'
export default {
	name: 'CategoryDialog',
	mixins: [itemDialogMixin('category')],
	methods: {
		saveCategory() {
			let opts = {
				loading: (v) => (this.loading = v),
				onValidation: ({ validation }) => (this.validation = validation),
				data: { category: this.category },
				successMessage: {
					title: 'Listo!',
					text: `La Categoría se ha ${this.isNew ? 'creado' : 'guardado'} correctamente`,
				},
				onSuccess: ({ data }) => {
					this.dialog = false
					this.$emit('saved', data.categoryId)
				},
				clearCache: '/catalog/categories',
			}

			if (this.isNew) {
				this.$adminApi.post('/catalog/categories', opts)
			} else {
				this.$adminApi.put(`/catalog/categories/${this.category.id}`, opts)
			}
		},
		deleteCategory() {
			this.$adminApi.delete(`/catalog/categories/${this.category.id}`, {
				loading: (v) => (this.loadingDelete = v),
				confirm: {
					title: 'La categoría será eliminada',
					text:
						'Todas las subcategorias serán eliminadas. Además, todos los productos que pertenezcan a esta categoría pasarán a estado "incompleto" y deberán ser asignados a una nueva categoría. ¿Desea continuar?',
					accept: 'Sí, eliminar',
				},
				onSuccess: () => {
					this.dialog = false
					this.$emit('deleted', this.category.id)
				},
				clearCache: '/catalog/categories',
			})
		},
	},
}
</script>

<template>
	<ItemDialog
		v-model="dialog"
		:title-text="isNew ? 'Nueva categoría' : 'Editar categoría'"
		:submit-text="isNew ? 'Crear' : 'Guardar'"
		:loading="loading"
		:loading-delete="loadingDelete"
		@submit="saveCategory"
		:deletable="!isNew"
		@delete="deleteCategory"
		max-width="700px"
	>
		<template>
			<Validator :validation="validation">
				<cont>
					<row>
						<c>
							<CategorySelector
								v-model="category.parentId"
								label="Categoría padre"
								clearable
								hint="Dejar vacío para crear categoría superior"
								persistent-hint
								:can-create="false"
								:disabled="!isNew"
								chips
								:multiple="false"
							/>
						</c>
						<c>
							<TextField v-model="category.name" label="Nombre de categoría" />
						</c>
						<c sm="8">
							<TextField
								v-model="category.menuPos"
								type="number"
								label="Posición menu"
								hint="Dejar vacío para no incluir en el menú"
								persistent-hint
							/>
						</c>
					</row>
				</cont>
			</Validator>
		</template>
	</ItemDialog>
</template>
