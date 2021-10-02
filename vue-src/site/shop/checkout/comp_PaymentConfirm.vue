<script>
import { compsFromContext } from '@/__shared/utils/lib_utils'

const dynComponents = compsFromContext(
	require.context('@/site', true, /-Payment-CheckoutConfirmCardContent\.vue$/)
)

export default {
	name: 'payment-confirm',
	components: {
		...dynComponents,
	},
	props: {
		order: Object,
	},
}
</script>

<template>
	<CardLayout title="Forma de Pago" v-bind="$attrs" v-on="$listeners" v-if="order.payments.length">
		<component :is="`${order.payments[0].methodKey}-Payment-CheckoutConfirmCardContent`" :order="order" />
	</CardLayout>
</template>
