<script>
import { get } from 'vuex-pathify'

export default {
	name: 'ContactData',
	data() {
		return {
			user: {},
			loading: false,
			validation: {},
			btnState: null,
		}
	},
	computed: {
		userData: get('shop/user'),
	},
	methods: {
		async updateContactInfo() {
			const { firstname, lastname, phonePrefix, phoneNumber, contactEmail } = this.user
			await this.$shopApi.put({
				url: '/user/user-update',
				loading: (visible) => (this.loading = visible),
				onValidation: ({ validation }) => (this.validation = validation),
				data: {
					firstname,
					lastname,
					phonePrefix,
					phoneNumber,
					contactEmail,
				},
				done: ({ success, data }) => {
					if (success) {
						this.btnState = 'success'
						this.$store.set('shop/user', data.user)
					} else {
						this.btnState = 'error'
					}
				},
			})
		},
	},
	created() {
		this.user = {
			firstname: this.userData.firstname,
			lastname: this.userData.lastname,
			contactEmail: this.userData.contactEmail,
			phonePrefix: this.userData.phonePrefix,
			phoneNumber: this.userData.phoneNumber,
		}
	},
}
</script>

<template>
	<form @submit.prevent="updateContactInfo">
		<Validator :validation="validation">
			<v-row>
				<v-col cols="12" md="6">
					<TextField label="Nombre" v-model="user.firstname" />
				</v-col>
				<v-col cols="12" md="6">
					<TextField label="Apellido" v-model="user.lastname" />
				</v-col>
				<v-col cols="12" md="6">
					<TextField label="Email de Contacto" v-model="user.contactEmail" />
				</v-col>
				<v-col cols="12" md="2">
					<TextField label="Prefijo" v-model="user.phonePrefix" />
				</v-col>
				<v-col cols="12" md="4">
					<TextField label="Teléfono" v-model="user.phoneNumber" />
				</v-col>
				<v-col cols="12" md="12" class="text-right">
					<MagicButton @click="updateContactInfo" v-model="btnState" large :loading="loading">
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
