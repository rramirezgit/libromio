<script>
export default {
	name: 'AdminChangePassForm',
	data: () => ({
		valid: false,
		oldPassword: '',
		newPassword: '',
		repeatNewPassword: '',
		showOldPass: false,
		showNewPass: false,
		showRepeatNewPass: false,
		emptyRules: [(v) => !!v || 'Este campo no puede estar vacio'],
		isBtnLoading: false,
	}),
	methods: {
		async submitForm() {},
	},
}
</script>

<template>
	<v-form ref="actProfileDataForm" lazy-validation v-model="valid" @submit.prevent="submitForm">
		<v-container>
			<v-row>
				<v-col cols="12" class="d-flex align-center">
					<Subtitle icon="mdi-lock" text="Cambiar contraseña" />
				</v-col>
				<v-col cols="12" md="4">
					<TextField
						:append-icon="showOldPass ? 'mdi-eye-off' : 'mdi-eye'"
						v-model="oldPassword"
						label="Contraseña actual"
						:type="showOldPass ? 'text' : 'password'"
						@click:append="showOldPass = !showOldPass"
					/>
				</v-col>
				<v-col cols="12" md="4">
					<TextField
						:append-icon="showNewPass ? 'mdi-eye-off' : 'mdi-eye'"
						v-model="newPassword"
						label="Nueva contraseña"
						:type="showNewPass ? 'text' : 'password'"
						@click:append="showNewPass = !showNewPass"
					/>
				</v-col>
				<v-col cols="12" md="4">
					<TextField
						:append-icon="showRepeatNewPass ? 'mdi-eye-off' : 'mdi-eye'"
						v-model="repeatNewPassword"
						label="Repite la nueva contraseña"
						:type="showRepeatNewPass ? 'text' : 'password'"
						@click:append="showRepeatNewPass = !showRepeatNewPass"
					/>
				</v-col>
				<v-col cols="12" class="text-right">
					<v-btn :disabled="!valid" color="primary" type="submit" :loading="isBtnLoading">
						ACTUALIZAR DATOS
					</v-btn>
				</v-col>
			</v-row>
		</v-container>
	</v-form>
</template>
