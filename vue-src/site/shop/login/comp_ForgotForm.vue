<script>
export default {
	name: 'ForgotForm',
	data() {
		return {
			email: null,
			successMsg: false,
			loading: false,
			validation: {},
		}
	},
	methods: {
		submit() {
			this.successMsg = false
			this.$shopApi.post({
				url: '/user/reset-pass',
				data: {
					email: this.email,
				},
				onValidation: ({ validation }) => (this.validation = validation),
				loading: (v) => (this.loading = v),
				onSuccess: () => {
					this.successMsg = true
				},
			})
		},
		openLogin() {
			this.$emit('openLogin')
		},
	},
}
</script>

<template>
	<v-form @submit.prevent="submit">
		<Validator :validation="validation">
			<Container>
				<v-row>
					<v-col cols="12" class="font-weight-bold">
						Ingresá el E-mail con el cual te registraste
					</v-col>

					<v-col cols="12">
						<TextField v-model="email" label="E-mail" />
					</v-col>
					<v-col cols="12" class="d-flex align-center">
						<v-btn class="primary" :loading="loading" type="submit">
							Recuperar
						</v-btn>
						<v-spacer />
						<v-btn text small @click.stop="openLogin">Cancelar</v-btn>
					</v-col>
					<v-col cols="12" v-if="successMsg">
						<v-alert text dense type="success">
							Te enviamos un email con la información para que puedas volver a acceder a tu cuenta.
							<br />
							<small>Si no lo encuentras en Bandeja de Entrada, revisa el Correo no deseado.</small>
							<div class="mt-2 text-right">
								<v-btn class="mt-2" color="primary" @click="openLogin" text>
									Acceder a mi cuenta
								</v-btn>
							</div>
						</v-alert>
					</v-col>
				</v-row>
			</Container>
		</Validator>
	</v-form>
</template>
