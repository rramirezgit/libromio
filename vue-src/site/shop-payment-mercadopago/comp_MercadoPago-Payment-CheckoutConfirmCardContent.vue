<script>
import MercadoPagoCardContent from './comp_MercadoPagoCardContent.vue'
export default {
	name: 'MercadoPago-Payment-CheckoutConfirmCardContent',
	props: {
		order: Object,
	},
	extends: MercadoPagoCardContent,
}
</script>
