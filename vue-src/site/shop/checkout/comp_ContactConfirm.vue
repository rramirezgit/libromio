<script>
import addressHelperMixin from '@/__shared/shop/mixin_address-helper.js'

export default {
	name: 'contact-confirm',
	mixins: [addressHelperMixin],
	props: {
		order: Object,
	},
	computed: {
		buyer() {
			return this.order.buyer
		},
		invoice() {
			return this.order.invoice
		},
		invoiceAddress() {
			return this.order.invoiceAddress
		},
	},
}
</script>

<template>
	<CardLayout title="Contacto y Facturación" v-bind="$attrs" v-on="$listeners">
		<v-row>
			<v-col cols="12">
				<div class="font-weight-bold primary--text pb-3">
					Datos de Contacto
				</div>
				<div>
					{{ buyer.firstname }} {{ buyer.lastname }}<br />
					{{ buyer.email }}<br />
					({{ buyer.phonePrefix }}) {{ buyer.phoneNumber }}
				</div>
			</v-col>
			<v-col cols="12">
				<div class="font-weight-bold primary--text pb-3">
					Datos de Facturación
				</div>
				<div v-if="invoice.business">
					{{ invoice.businessName }}<br />
					CUIT {{ invoice.businessIdNumber }}<br />
					Factura {{ invoice.invoiceType }}<br />
					{{ getAddressLine(invoiceAddress) }}
				</div>
				<div v-else>
					{{ invoice.personLastname }}, {{ invoice.personFirstname }}<br />
					DNI {{ invoice.personIdNumber }}<br />
					{{ getAddressLine(invoiceAddress) }}
				</div>
			</v-col>
		</v-row>
	</CardLayout>
</template>
