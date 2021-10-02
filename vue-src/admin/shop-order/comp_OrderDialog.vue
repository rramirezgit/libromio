<script>
import itemDialogMixin from '@/admin/admin/mixin_item-dialog'
export default {
	name: 'OrderDialog',
	mixins: [itemDialogMixin('order')],
	methods: {
		saveOrder() {
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
	},
}
</script>

<template>
	<ItemDialog
		v-model="dialog"
		:loading="loading"
		:deletable="false"
		fullscreen
		transition="dialog-bottom-transition"
		no-actions
	>
		<template #header="{ closeDialog }">
			<div>Orden de compra</div>
			<div class="px-3 link--text">#{{ order.code }}</div>
			<v-spacer />
			<Button text color="primary" @click="closeDialog"> Cerrar </Button>
		</template>
		<cont>
			<row>
				<c>
					<!-- <TextField v-model="order.code" label="Nombre de la marca" /> -->
				</c>
			</row>
		</cont>
	</ItemDialog>
</template>
