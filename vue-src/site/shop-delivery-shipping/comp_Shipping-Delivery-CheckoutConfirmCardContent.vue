<script>
import addressHelperMixin from '@/__shared/shop/mixin_address-helper'
import { compsFromContext } from '@/__shared/utils/lib_utils'

const carriersComponents = compsFromContext(
	require.context('@/site', true, /-Carrier-CheckoutConfirmCardContent\.vue$/)
)

export default {
	name: 'Shipping-Delivery-CheckoutConfirmCardContent',
	mixins: [addressHelperMixin],
	components: {
		...carriersComponents,
	},
	props: {
		order: Object,
	},
}
</script>

<template>
	<div>
		<div class="font-weight-bold primary--text pb-3">Envío a domicilio</div>
		<div>{{ getAddressLine(order.delivery.data.address) }}</div>
		<component :is="`${order.delivery.optionKey}-Carrier-CheckoutConfirmCardContent`" :order="order" />
	</div>
</template>
