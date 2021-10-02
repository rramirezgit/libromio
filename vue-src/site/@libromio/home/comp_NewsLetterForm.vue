<script>
export default {
	name: 'NewsLetterForm',
	data() {
		return {
			email: '',
			isLoading: false,
			successMsg: false,
			formMsg: null,
			isSuccess: false,
			validation: {},
		}
	},
	methods: {
		saveEmail() {
			if (this.isLoading) {
				return
			}
			this.$shopApi.post({
				url: '/tienda/savenewsletteremail',
				//url: '/user/savenewsletteremail',
				data: {
					email: this.email,
				},
				loading: (v) => (this.isLoading = v),
				onValidation: ({ validation }) => (this.validation = validation),
				onSuccess: () => {
					this.successMsg = 'Gracias por registrar tu correo en nuestro newsletter.'
					this.isSuccess = true
				},
			})
		},
	},
	computed: {
		isMobile() {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					return true
				default:
					return false
			}
		},
	},
}
</script>

<template>
	<div>
		<div class="d-flex justify-center flex-column flex-sm-row">
			<div :class="!isMobile && 'parent-form'">
				<form @submit.prevent>
					<Validator :validation="validation">
						<TextField
							v-if="!isSuccess"
							v-model="email"
							label="Ingresá tu email"
							@keydown.enter="saveEmail"
							outlined
							rounded
							solo
							flat
						>
						</TextField>
					</Validator>
				</form>
			</div>
			<div :class="!isMobile && 'newsletter-cta-parent'">
				<v-btn
					rounded
					class="primary-dark-purple white--text pl-12 pr-12"
					:class="!isMobile ? 'newsletter-cta' : 'mt-6 pt-7 pb-7'"
					@click="saveEmail"
					:loading="isLoading"
				>
					QUIERO SUSCRIBIRME
				</v-btn>
			</div>
		</div>
		<div v-if="successMsg" class="font-weight-bold">
			{{ successMsg }}
		</div>
	</div>
</template>

<style scoped>
.parent-form {
	max-width: 500px;
	width: 90%;
}

.newsletter-cta-parent {
	margin-left: -55px;
}

.newsletter-cta {
	height: 100% !important;
}
</style>
