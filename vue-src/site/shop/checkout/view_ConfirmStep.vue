<script>
import { compsFromContext } from '@/__shared/utils/lib_utils'

const dynComponents = compsFromContext(require.context('.', true, /Confirm\.vue$/))

export default {
	name: 'ConfirmStepPage',
	components: {
		...dynComponents,
	},
}
</script>

<template>
	<CheckoutLayout title="Confirmá tu Compra" step="confirm" summaryCta="Realizar pago">
		<template #step="{genStepRoute, confirmSteps, order}">
			<component
				v-for="stepKey of confirmSteps"
				:key="stepKey"
				:is="`${stepKey}-confirm`"
				:order="order"
				class="pl-1 pr-1"
				:clickable="false"
				link-text="Modificar"
				@linkClick="$router.push(genStepRoute(stepKey, { edit: true }))"
			/>
		</template>
	</CheckoutLayout>
</template>
