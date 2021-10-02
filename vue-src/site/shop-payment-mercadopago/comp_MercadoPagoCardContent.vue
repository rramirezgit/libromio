<script>
export default {
	name: 'MercadoPagoCardContent',
	data() {
		return {
			cardsLogos: [
				'https://foschia.com.ar/static/img/cards/logo_visa.svg?x=1607945231',
				'https://foschia.com.ar/static/img/cards/logo_master.svg?x=1607945230',
				'https://foschia.com.ar/static/img/cards/logo_amex.svg?x=1607945230',
				'https://foschia.com.ar/static/img/ahora-12.svg?x=1607945225',
				'https://foschia.com.ar/static/img/ahora-18.svg?x=1607945225',
			],
		}
	},
}
</script>

<template>
	<div>
		<div class="font-weight-bold primary--text">
			Mercado Pago
		</div>
		<v-list>
			<v-list-item class="pl-1" dense>
				<v-list-item-icon class="mr-0">
					<v-icon small>mdi-chevron-right</v-icon>
				</v-list-item-icon>
				<v-list-item-content class="pa-0">
					Sin recargo adicional
				</v-list-item-content>
			</v-list-item>
			<v-list-item class="pl-1" dense>
				<v-list-item-icon class="mr-0">
					<v-icon small>mdi-chevron-right</v-icon>
				</v-list-item-icon>
				<v-list-item-content class="pa-0">
					Pagá en cuotas sin interés con tarjetas seleccionadas
				</v-list-item-content>
			</v-list-item>
		</v-list>
		<div class="d-flex flex-wrap pt-4">
			<v-img
				v-for="imgUrl in cardsLogos"
				:key="imgUrl"
				:src="imgUrl"
				max-width="60"
				max-height="20"
				class="mb-2 mr-2"
				contain
			/>
		</div>
	</div>
</template>
