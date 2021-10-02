<script>
import { compsFromContext } from '@/__shared/utils/lib_utils'

const dynComponents = compsFromContext(require.context('@/site', true, /-Payment-CheckoutOptions\.vue$/))

export default {
	name: 'PaymentStepPage',
	components: {
		...dynComponents,
	},
}
</script>

<template>
	<CheckoutLayout title="Elegí la forma de pago" step="payment">
		<template #step="{paymentMethods, sendPayload}">
			<component
				v-for="(method, i) in paymentMethods"
				:key="i"
				:is="`${method.methodKey}-Payment-CheckoutOptions`"
				:data="method.checkoutData"
				@optionSelected="sendPayload({ methodKey: method.methodKey, input: $event })"
			/>
		</template>
	</CheckoutLayout>
</template>

<style></style>
