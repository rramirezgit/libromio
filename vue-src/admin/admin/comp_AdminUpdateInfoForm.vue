<script>
export default {
	name: 'AdminUpdateInfoForm',
	data() {
		return {
			admin: this.$store.copy('app/admin'),
			btnLoading: false,
			validation: {},
		}
	},
	computed: {
		permissions() {
			return this.admin.permissions.map((p) => p.name)
		},
	},
	methods: {
		async save() {
			await this.$adminApi.put({
				url: '/admin/me',
				data: {
					email: this.admin.email,
					firstname: this.admin.firstname,
					lastname: this.admin.lastname,
				},
				onValidation: ({ validation }) => (this.validation = validation),
				successMessage: {
					title: 'Listo!',
					text: 'Tus datos han sido actualizados',
				},
				onSuccess: ({ data: { admin } }) => {
					this.admin = admin
					this.$store.set('app/admin', { ...admin })
				},
				loading: (visible) => (this.btnLoading = visible),
			})
		},
	},
}
</script>

<template>
	<v-container>
		<v-row>
			<v-col cols="12">
				<Subtitle icon="mdi-account" text="Usuario" />
			</v-col>
			<v-col cols="12" md="4">
				<TextField :value="admin.username" readonly label="Usuario" />
			</v-col>
			<v-col cols="12" md="4">
				<Autocomplete
					small-chips
					:items="permissions"
					:value="permissions"
					readonly
					label="Permisos"
					multiple
					append-icon=""
				/>
			</v-col>
		</v-row>
		<Validator :validation="validation">
			<v-row>
				<v-col cols="12">
					<Subtitle icon="mdi-card-account-details" text="Datos personales" />
				</v-col>
				<v-col cols="12" md="4">
					<TextField v-model="admin.email" label="Email" />
				</v-col>
				<v-col cols="12" md="4">
					<TextField v-model="admin.firstname" label="Nombre" />
				</v-col>
				<v-col cols="12" md="4">
					<TextField v-model="admin.lastname" label="Apellido" />
				</v-col>
				<v-col cols="12" class="text-right">
					<v-btn color="success" :loading="btnLoading" @click="save">
						GUARDAR
					</v-btn>
				</v-col>
			</v-row>
		</Validator>
	</v-container>
</template>
