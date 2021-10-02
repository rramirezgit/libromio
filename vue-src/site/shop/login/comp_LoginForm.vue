<script>
export default {
	name: 'LoginForm',
	data() {
		return {
			loginForm: {},
			loginError: false,
			loading: false,
			showPassword: false,
		}
	},
	methods: {
		submitLogin() {
			this.loading = true
			this.loginError = false
			this.$shopApi.post({
				url: '/user/signin',
				data: {
					email: this.loginForm.email,
					password: this.loginForm.password,
				},
				loading: (v) => (this.loading = v),
				done: ({ data, success }) => {
					if (success) {
						this.$store.set('shop/user', data.user)
						this.loginForm = {}
						this.$store.set('shop/loginDrawer', false)
					} else {
						this.loginError = true
					}
				},
			})
		},
		openForgot() {
			this.$emit('openForgot')
		},
		openNew() {
			this.$emit('openNew')
		},
	},
}
</script>

<template>
	<Container class="pl-0 pr-0 pl-sm-3 pr-sm-3">
		<v-row class="pb-0">
			<v-col cols="12" class="font-weight-bold">
				Con tu cuenta de Google o Facebook
			</v-col>
			<v-col cols="12" class="d-flex flex-wrap">
				<GoogleAuthButton class="mr-3 mb-3" />
				<FacebookAuthButton class="mr-3 mb-3" />
			</v-col>
			<v-col cols="12" class="font-weight-bold mt-2">
				Con tu e-mail
			</v-col>
		</v-row>
		<v-form @submit.prevent="submitLogin">
			<v-row>
				<v-col cols="12">
					<TextField v-model="loginForm.email" name="email" label="E-mail" />
				</v-col>
				<v-col cols="12">
					<TextField
						v-model="loginForm.password"
						label="Contraseña"
						name="password"
						:type="showPassword ? 'text' : 'password'"
						:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
						@click:append="showPassword = !showPassword"
					/>
				</v-col>
				<v-col cols="12" v-if="loginError">
					<b class="error--text">El usuario o contraseña son incorrectos</b>
				</v-col>
				<v-col cols="12" class="d-flex align-center flex-wrap">
					<v-btn :loading="loading" tile class="primary mb-4 mr-2" type="submit">
						INGRESAR
					</v-btn>
					<v-spacer />
					<v-btn text small @click="openForgot" class="pl-0 mb-4">
						Olvidé mi contraseña
					</v-btn>
				</v-col>
			</v-row>
		</v-form>
		<v-row>
			<v-col cols="12" class="subtitle-1 font-weight-bold mt-0">
				¿No tenés cuenta?
			</v-col>
			<v-col cols="12">
				<v-btn tile class="primary small-btn" @click="openNew">
					CREAR NUEVA CUENTA
				</v-btn>
			</v-col>
		</v-row>
	</Container>
</template>

<style scoped>
.small-btn {
	min-width: 142px !important;
}
</style>
