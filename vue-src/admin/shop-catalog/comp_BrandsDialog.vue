<script>
import itemDialogMixin from '@/admin/admin/mixin_item-dialog'
export default {
	name: 'BrandsDialog',
	mixins: [itemDialogMixin('brand')],
	methods: {
		saveBrand() {
			let opts = {
				loading: (v) => (this.loading = v),
				onValidation: ({ validation }) => (this.validation = validation),
				data: { brand: this.brand },
				files: { logoFile: this.brand.logoFile },
				successMessage: {
					title: 'Listo!',
					text: `La Marca se ha ${this.isNew ? 'creado' : 'guardado'} correctamente`,
				},
				onSuccess: ({ data }) => {
					this.dialog = false
					this.$emit('saved', data.brand)
				},
				clearCache: '/catalog/brands',
			}

			if (this.isNew) {
				this.$adminApi.post('/catalog/brands', opts)
			} else {
				this.$adminApi.put(`/catalog/brands/${this.brand.id}`, opts)
			}
		},
		deleteBrand() {
			let opts = {
				loading: (v) => (this.loadingDelete = v),
				confirm: {
					title: `La Marca será eliminada`,
					text: `¿Desea continuar?`,
					accept: 'Sí, eliminar',
				},
				onSuccess: () => {
					this.dialog = false
					this.$emit('deleted')
				},
				clearCache: '/catalog/brands',
			}
			this.$adminApi.delete(`/catalog/brands/${this.brand.id}`, opts)
		},
	},
}
</script>

<template>
	<ItemDialog
		v-model="dialog"
		:title-text="isNew ? 'Crear marca' : 'Editar marca'"
		:submit-text="isNew ? 'Crear' : 'Guardar'"
		:loading="loading"
		:deletable="!isNew"
		@delete="deleteBrand"
		:loading-delete="loadingDelete"
		@submit="saveBrand"
	>
		<Validator :validation="validation">
			<cont>
				<row>
					<c>
						<TextField v-model="brand.name" label="Nombre de la marca" />
					</c>
					<c>
						Logo
						<ImageInput
							ref="imageInput"
							v-model="brand.logoFile"
							:initial-src="brand.logoUrl"
							editable
							:clearable="!!brand.logoFile"
						/>
					</c>
				</row>
			</cont>
		</Validator>
	</ItemDialog>
</template>
