<script>
import addressHelperMixin from '@/__shared/shop/mixin_address-helper.js'

export default {
	name: 'Shipping-Delivery-CheckoutOptions',
	mixins: [addressHelperMixin],
	props: {
		data: Object,
		checkout: Object,
	},
	data() {
		return {
			address: null,
			dialog: false,
			loadingCost: false,
			cost: null,
		}
	},
	computed: {
		optionReady() {
			return this.address && this.cost !== null
		},
	},
	methods: {
		onAddressSelected(address) {
			this.address = address
			this.$shopApi.post({
				url: '/checkout/delivery/shipping/andreani/calculate',
				data: { zipcodeId: address.zipcodeId },
				query: { hash: this.checkout.hash },
				loading: (v) => (this.loadingCost = v),
				onSuccess: ({ data }) => {
					this.cost = data.cost
				},
			})
		},
		onOptionClick() {
			if (this.optionReady) {
				this.$emit('optionSelected', { address: this.address })
			} else {
				this.dialog = true
			}
		},
	},
}
</script>

<template>
	<div>
		<CardLayout clickable @cardClick="onOptionClick">
			<div class="font-weight-bold primary--text pb-3">
				Envío a domicilio
			</div>
			<div v-if="loadingCost">
				<v-progress-circular size="40" indeterminate class="mr-2" />
				Calculando costo de envío
			</div>
			<div v-else-if="optionReady">
				<div class="pb-2">Costo de envío <PriceText :amount="cost" class="font-3" /></div>
				<div>{{ getAddressLine(address) }}</div>
				<v-btn color="primary" small @click.prevent.stop="dialog = true" class="mt-3">
					Cambiar dirección de envío
				</v-btn>
			</div>
			<div v-else>
				Ingresá tu dirección
			</div>
		</CardLayout>
		<AddressDialog
			v-model="dialog"
			@addressSelected="onAddressSelected"
			title="Confirmá la dirección de envío"
		/>
	</div>
</template>
