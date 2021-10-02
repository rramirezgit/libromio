<script>
export default {
	name: 'DiscountStepPage',
	data() {
		return {
			couponCode: null,
			validation: {},
		}
	},
	methods: {
		onStepLoaded(data) {
			let payload = data.checkout.steps.discount
			if (!payload) return
			this.couponCode = payload.couponCode
		},
	},
}
</script>

<template>
	<CheckoutLayout
		title="Aplicá descuentos"
		step="discount"
		@payloadValidation="validation = $event"
		@stepLoaded="onStepLoaded"
	>
		<template #step="{sendPayload}">
			<CardLayout @cardClick="sendPayload({ noCode: true })" clickable>
				<div class="text-body-1 font-weight-bold">
					No tengo descuentos adicionales
				</div>
			</CardLayout>
			<CardLayout :clickable="false">
				<div class="text-body-1 font-weight-bold pb-2">
					Cupón de descuento
				</div>
				<div class="pb-4">
					Ingresá tu código de descuento.<br />
					<small>No acumulable con otras promociones</small>
				</div>
				<div>
					<v-form @submit.prevent="sendPayload({ couponCode })">
						<Validator :validation="validation">
							<v-row>
								<v-col cols="12">
									<TextField
										v-model="couponCode"
										label="Código del cupón"
										placeholder="Ingresá el código del cupón"
									/>
								</v-col>
								<v-col cols="12" class="d-flex">
									<v-spacer />
									<v-btn color="primary" @click="sendPayload({ couponCode })">
										Aplicar
									</v-btn>
								</v-col>
							</v-row>
						</Validator>
					</v-form>
				</div>
			</CardLayout>
		</template>
	</CheckoutLayout>
</template>

<style></style>
