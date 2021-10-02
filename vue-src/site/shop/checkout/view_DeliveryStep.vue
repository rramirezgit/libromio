<script>
import { compsFromContext } from '@/__shared/utils/lib_utils'

const dynComponents = compsFromContext(require.context('@/site', true, /-Delivery-CheckoutOptions\.vue$/))

export default {
	name: 'DeliveryStepPage',
	components: {
		...dynComponents,
	},
}
</script>

<template>
	<CheckoutLayout title="Elegí cómo recibir tu compra" step="delivery">
		<template #step="{deliveryMethods, sendPayload, checkout}">
			<component
				v-for="(method, i) in deliveryMethods"
				:key="i"
				:is="`${method.methodKey}-Delivery-CheckoutOptions`"
				:data="method.checkoutData"
				:checkout="checkout"
				@optionSelected="sendPayload({ methodKey: method.methodKey, input: $event })"
			/>
		</template>
	</CheckoutLayout>
</template>

<style></style>
