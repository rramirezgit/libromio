<script>
import payOrderMixin from '@/site/shop/order/mixin_pay-order'
export default {
	name: 'MercadoPago-Payment-InstructionsCardContent',
	mixins: [payOrderMixin],
	props: {
		order: Object,
	},
	data() {
		return {
			loading: false,
		}
	},
	methods: {
		payOrder() {
			this.payOrderCall(this.order, {
				loading: (v) => (this.loading = v),
			})
		},
	},
}
</script>

<template>
	<div>
		<div class="primary--text font-2">
			<b>Si aún no realizaste el pago</b> o querés volver a intentarlo,
			<b>hacé click en el siguiente botón</b> y serás redirigido a la pantalla de pago.
		</div>
		<div class="py-5">
			<v-btn color="success" :loading="loading" @click="payOrder">
				Realizar pago
			</v-btn>
		</div>
		<div class="font-1">
			Te solicitamos que <b>realices el pago dentro de las 72 hs.</b> después de la confirmación tu compra.
			Luego de ese plazo tu orden será cancelada.
		</div>
	</div>
</template>
