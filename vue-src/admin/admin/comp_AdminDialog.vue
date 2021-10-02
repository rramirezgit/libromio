<script>
import itemDialogMixin from '@/admin/admin/mixin_item-dialog'
export default {
	name: 'AdminDialog',
	mixins: [itemDialogMixin('admin')],
	methods: {
		saveUser() {
			let opts = {
				loading: (v) => (this.loading = v),
				onValidation: ({ validation }) => (this.validation = validation),
				data: { user: this.admin },
				successMessage: {
					title: 'Listo!',
					text: `El usuario se ha ${this.isNew ? 'creado' : 'guardado'} correctamente`,
				},
				onSuccess: ({ data }) => {
					this.dialog = false
					this.$emit('saved', data.user)
				},
				clearCache: '/admin/users',
			}

			if (this.isNew) {
				this.$adminApi.post('/admin/users', opts)
			} else {
				this.$adminApi.put(`/admin/users/${this.admin.id}`, opts)
			}
		},
		deleteUser() {
			this.$adminApi.delete(`/admin/users/${this.admin.id}`, {
				loading: (v) => (this.loadingDelete = v),
				confirm: {
					title: `El usuario será eliminado`,
					text: `¿Desea continuar?`,
					accept: 'Sí, eliminar',
				},
				onSuccess: () => {
					this.dialog = false
					this.$emit('deleted')
				},
				clearCache: '/admin/users',
			})
		},
		newPermision(permissions) {
			this.admin.rol = permissions.join(',')
		},
	},
}
</script>

<template>
	<ItemDialog
		v-model="dialog"
		:title-text="isNew ? 'Crear usuario' : 'Editar usuario'"
		:submit-text="isNew ? 'Crear' : 'Guardar'"
		:loading="loading"
		:deletable="!isNew"
		@delete="deleteUser"
		:loading-delete="loadingDelete"
		@submit="saveUser"
	>
		<Validator :validation="validation">
			<cont>
				<row>
					<c>
						<TextField v-model="admin.username" label="Nombre de Usuario" />
					</c>
					<c>
						<TextField v-model="admin.email" label="Email" />
					</c>
					<c md="6">
						<TextField v-model="admin.firstname" label="Nombre" />
					</c>
					<c md="6">
						<TextField v-model="admin.lastname" label="Apellido" />
					</c>
					<c>
						<TextField v-model="admin.password" label="Contraseña" />
					</c>
				</row>
				<row>
					<c>
						Permisos:<br />
						<AdminPermissions :permissions="admin.permissions" @updatedPermission="newPermision" />
					</c>
				</row>
			</cont>
		</Validator>
	</ItemDialog>
</template>
