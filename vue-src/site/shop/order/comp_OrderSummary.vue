<script>
export default {
	name: 'OrderSummary',
	props: {
		order: Object,
		showHideBtn: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		items() {
			return this.order ? this.order.items : []
		},
	},
	methods: {},
}
</script>

<template>
	<v-card tile v-if="order">
		<v-card-text>
			<div class="d-flex align-center">
				<div class="text-h5 mb-2 mb-sm-4 font-weight-bold primary--text">
					Resumen de compra
				</div>
				<template v-if="showHideBtn">
					<v-spacer />
					<v-btn color="primary" class="high-index" text small>
						Ocultar
						<v-icon> mdi-chevron-down </v-icon>
					</v-btn>
				</template>
			</div>
			<v-divider></v-divider>
			<div class="" v-for="(item, i) of items" :key="item.id">
				<SummaryItem :item="item" :order="order" class="py-4 px-sm-2" />
				<v-divider v-if="i < items.length - 1" />
			</div>
			<CartTotals :order="order" />
		</v-card-text>
	</v-card>
</template>

<style></style>
