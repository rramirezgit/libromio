<script>
import Api from '@/__shared/utils/lib_api'
import defaultLogoImage from '@/admin/admin/asset_logo.png'

export default {
	name: 'Login',
	props: {
		msg: String,
	},
	metaInfo() {
		return { title: 'Login | Admin' }
	},
	data: () => ({
		valid: false,
		form: {
			username: '',
			password: '',
			remember: null,
		},
		rules: {
			username: [(v) => !!v || 'Debes introducir tu usuario'],
			password: [(v) => !!v || 'Debes introducir tu contraseña'],
		},
		showPass: false,
		isBtnLoading: false,
		formMsg: null,
		isSuccess: false,
		readonlyHack: true,
	}),
	computed: {
		logoImage() {
			return this.$srv('AdminTheme.logo', defaultLogoImage)
		},
		title() {
			return this.$srv('AdminTheme.name', 'Panel Administrador')
		},
	},
	methods: {
		async submitForm() {
			if (!this.$refs.loginForm.validate()) return
			this.formMsg = null
			let api = new Api({
				baseUrl: `${process.env.VUE_APP_ADMIN_BASE_URL}`,
			})
			let { success } = await api.post('/login', {
				data: this.form,
				loading: (v) => (this.isBtnLoading = v),
			})
			if (!success) {
				this.formMsg = 'El usuario o contraseña es incorrecto, por favor intenta de nuevo'
			}
		},
	},
	mounted() {
		setTimeout(() => (this.readonlyHack = false), 1000)
	},
}
</script>

<template>
	<v-card width="400" max-width="90%" class="pa-4">
		<v-card-title align="center">
			<v-img :src="logoImage" height="70" contain />
		</v-card-title>
		<v-card-title align="center">
			<v-flex>
				{{ title }}
			</v-flex>
		</v-card-title>
		<v-card-text v-if="formMsg">
			<div class="text-center" :class="isSuccess ? 'success--text' : 'error--text'">
				{{ formMsg }}
			</div>
		</v-card-text>
		<v-card-text>
			<v-form ref="loginForm" lazy-validation v-model="valid" @submit.prevent="submitForm">
				<v-row dense>
					<v-col cols="12">
						<v-text-field
							v-model="form.username"
							:rules="rules.username"
							label="Usuario"
							:readonly="readonlyHack"
						/>
					</v-col>
					<v-col cols="12">
						<v-text-field
							:append-icon="showPass ? 'mdi-eye-off' : 'mdi-eye'"
							v-model="form.password"
							:rules="rules.password"
							label="Contraseña"
							:type="showPass ? 'text' : 'password'"
							@click:append="showPass = !showPass"
							required
						/>
					</v-col>
					<v-col cols="12">
						<v-checkbox
							v-model="form.remember"
							:value="true"
							label="Recordar usuario"
							type="checkbox"
							required
						/>
					</v-col>
					<v-col cols="12" class="text-center">
						<v-btn :disabled="!valid" color="primary" type="submit" :loading="isBtnLoading">
							ENTRAR
						</v-btn>
					</v-col>
				</v-row>
			</v-form>
		</v-card-text>
		<v-card-text class="text-center">
			<router-link :to="{ name: 'forgot' }">
				Recuperar contraseña
			</router-link>
		</v-card-text>
	</v-card>
</template>
