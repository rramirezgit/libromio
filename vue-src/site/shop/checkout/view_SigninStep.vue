<script>
import { get } from 'vuex-pathify'
export default {
	name: 'PaymentStepPage',
	data() {
		return {
			tab: 'login',
		}
	},
	computed: {
		user: get('shop/user'),
	},
	watch: {
		user(value) {
			if (value) this.$refs.step.sendPayload()
		},
	},
}
</script>

<template>
	<CheckoutLayout title="Ingresá o Registrate" step="signin" ref="step">
		<template #step="{}">
			<CardLayout>
				<LoginForm v-if="tab == 'login'" @openForgot="tab = 'forgot'" @openNew="tab = 'newAccount'" />
				<ForgotForm v-if="tab == 'forgot'" @openLogin="tab = 'login'" />
				<SignupForm v-if="tab == 'newAccount'" @openLogin="tab = 'login'" />
			</CardLayout>
		</template>
	</CheckoutLayout>
</template>

<style></style>
