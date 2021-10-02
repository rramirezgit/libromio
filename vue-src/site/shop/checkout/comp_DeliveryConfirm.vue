<script>
import { compsFromContext } from '@/__shared/utils/lib_utils'

const dynComponents = compsFromContext(
	require.context('@/site', true, /-Delivery-CheckoutConfirmCardContent\.vue$/)
)

export default {
	name: 'delivery-confirm',
	components: {
		...dynComponents,
	},
	props: {
		order: Object,
	},
}
</script>

<template>
	<CardLayout title="Forma de Entrega" v-bind="$attrs" v-on="$listeners" v-if="order.delivery">
		<component :is="`${order.delivery.methodKey}-Delivery-CheckoutConfirmCardContent`" :order="order" />
	</CardLayout>
</template>
