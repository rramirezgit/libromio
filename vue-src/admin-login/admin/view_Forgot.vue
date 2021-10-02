<script>
import defaultLogoImage from '@/admin/admin/asset_logo.png'

export default {
	name: 'Forgot',
	props: {
		msg: String,
	},
	metaInfo() {
		return { title: 'Recuperar contraseña | Admin' }
	},
	data: () => ({
		valid: false,
		email: '',
		emailRules: [
			(v) => !!v || 'Debes introducir un email',
			(v) => /.+@.+/.test(v) || 'Debes usar un email valido',
		],
		isBtnLoading: false,
		formMsg: null,
		isSuccess: false,
	}),
	computed: {
		logoImage() {
			return this.$srv('AdminTheme.logo', defaultLogoImage)
		},
	},
	methods: {
		submitForm() {
			let isValidated = this.$refs.loginForm.validate()
			if (isValidated) {
				this.isBtnLoading = true
				setTimeout(
					function() {
						this.formMsg = 'Te hemos enviado un mail con los pasos para recuperar tu contraseña'
						this.isSuccess = true
						this.isBtnLoading = false
					}.bind(this),
					2000
				)
			}
		},
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
				Recuperar contraseña
			</v-flex>
		</v-card-title>
		<v-card-text v-if="formMsg">
			<div class="text-center" :class="isSuccess ? 'success--text' : 'error--text'">
				{{ formMsg }}
			</div>
		</v-card-text>
		<v-card-text>
			<v-form
				ref="loginForm"
				lazy-validation
				v-model="valid"
				@submit.prevent="submitForm"
				v-if="!isSuccess"
			>
				<v-row dense>
					<v-col align="center" cols="12">
						<v-text-field v-model="email" :rules="emailRules" label="Email" />
					</v-col>
					<v-col align="center" cols="12">
						<v-btn color="primary" :disabled="!valid" type="submit" :loading="isBtnLoading">
							Enviar
						</v-btn>
					</v-col>
				</v-row>
			</v-form>
		</v-card-text>
		<v-card-text class="text-center">
			<router-link :to="{ name: 'login' }">
				Volver
			</router-link>
		</v-card-text>
	</v-card>
</template>
