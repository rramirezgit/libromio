<script>
export default {
	name: 'ChangePassword',
	data() {
		return {
			showPassword: false,
			user: {},
			loading: false,
			validation: {},
			btnState: null,
		}
	},
	methods: {
		async changePassword() {
			await this.$shopApi.put('/user/password-update', {
				loading: (visible) => (this.loading = visible),
				onValidation: ({ validation }) => (this.validation = validation),
				data: {
					currentPassword: this.user.currentPassword || '',
					rawPassword: this.user.rawPassword || '',
					rawPassword2: this.user.rawPassword2 || '',
				},
				done: ({ success }) => {
					if (success) {
						this.user = {}
						this.btnState = 'success'
					} else {
						this.btnState = 'error'
					}
				},
			})
		},
	},
}
</script>

<template>
	<form @submit.prevent>
		<Validator :validation="validation">
			<v-row>
				<v-col cols="12">
					<TextField
						label="Contraseña actual"
						v-model="user.currentPassword"
						dense
						:type="showPassword ? 'text' : 'password'"
						:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
						@click:append="showPassword = !showPassword"
					/>
				</v-col>
				<v-col cols="12">
					<TextField
						label="Nueva contraseña"
						v-model="user.rawPassword"
						width="100%"
						dense
						:type="showPassword ? 'text' : 'password'"
						:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
						@click:append="showPassword = !showPassword"
					/>
				</v-col>
				<v-col cols="12">
					<TextField
						label="Repetir"
						v-model="user.rawPassword2"
						dense
						:type="showPassword ? 'text' : 'password'"
						:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
						@click:append="showPassword = !showPassword"
					/>
				</v-col>
				<v-col cols="12" class="text-right">
					<MagicButton @click="changePassword" v-model="btnState" large :loading="loading">
						Guardar Cambios
						<template #success> <v-icon>mdi-check</v-icon> Listo! </template>
						<template #error> Oops! Revisa el formulario </template>
					</MagicButton>
				</v-col>
			</v-row>
		</Validator>
	</form>
</template>

<style></style>
