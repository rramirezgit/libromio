<script>
export default {
	name: 'SignupForm',
	data() {
		return {
			user: {},
			loading: false,
			validation: {},
		}
	},
	methods: {
		submit() {
			this.loading = true
			this.$shopApi.post({
				url: '/user/signup',
				loading: (v) => (this.loading = v),
				data: {
					firstname: this.user.firstname,
					lastname: this.user.lastname,
					rawPassword: this.user.rawPassword,
					accountEmail: this.user.accountEmail,
				},
				onValidation: ({ validation }) => (this.validation = validation),
				done: ({ data, success }) => {
					if (success) {
						this.$store.set('shop/user', data.user)
						this.$store.set('shop/loginDrawer', false)
					} else {
						this.loginError = true
					}
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
	<Validator :validation="validation">
		<Container>
			<v-row>
				<v-col cols="12" class="font-weight-bold">
					Con tu cuenta de Google o Facebook
				</v-col>
				<v-col cols="12" class="d-flex flex-wrap">
					<GoogleAuthButton class="mr-3 mb-3" />
					<FacebookAuthButton class="mr-3 mb-3" />
				</v-col>
				<v-col cols="12" class="font-weight-bold">
					Registrate con tu e-mail
				</v-col>
				<v-col cols="12" md="6">
					<TextField v-model="user.firstname" label="Nombre" />
				</v-col>
				<v-col cols="12" md="6">
					<TextField v-model="user.lastname" label="Apellido" />
				</v-col>
				<v-col cols="12">
					<TextField v-model="user.accountEmail" label="E-mail" />
				</v-col>
				<v-col cols="12">
					<TextField v-model="user.rawPassword" label="Contraseña" type="password" />
				</v-col>
				<v-col cols="12" class="d-flex align-center flex-wrap">
					<v-btn tile class="primary mb-4" @click="submit" :loading="loading">
						Crear cuenta
					</v-btn>
					<v-spacer />
					<v-btn class="pl-0 pr-0 mb-4" text small @click="openLogin">
						Ya tengo una cuenta
					</v-btn>
				</v-col>
			</v-row>
		</Container>
	</Validator>
</template>
