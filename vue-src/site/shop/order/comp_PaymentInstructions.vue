<script>
import { compsFromContext } from '@/__shared/utils/lib_utils'

export default {
	name: 'PaymentInstructions',
	components: {
		...compsFromContext(require.context('@/site', true, /-Payment-InstructionsCardContent\.vue$/)),
	},
	props: {
		order: Object,
	},
}
</script>

<template>
	<CardLayout title="¿Cómo realizo el pago?" v-bind="$attrs" v-on="$listeners" v-if="order.payments.length">
		<component :is="`${order.payments[0].methodKey}-Payment-InstructionsCardContent`" :order="order" />
	</CardLayout>
</template>
