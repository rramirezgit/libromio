<script>
export default {
	name: 'OrderListCard',
	props: {
		order: Object,
		linkText: String,
		linkLoading: Boolean,
	},
	computed: {
		mainStatus() {
			return this.order.mainStatus
		},
		paymentStatus() {
			return this.order.paymentStatus
		},
		delivery() {
			return this.order.delivery
		},
		titleStatus() {
			return this.order.statusesInfo.title
		},
	},
	methods: {
		gotoDetail() {
			this.$router.push({ name: 'user.order-detail', params: { id: this.order.id } })
		},
	},
}
</script>

<template>
	<CardLayout>
		<template #title>
			<div
				class="px-2 rounded"
				:class="`${titleStatus.color} lighten-5 ${titleStatus.color}--text text--darken-2`"
			>
				{{ titleStatus.name }}
			</div>
			<v-spacer />
			<v-btn
				v-if="linkText"
				@click.prevent.stop="$emit('linkClick')"
				color="link"
				text
				small
				:loading="linkLoading"
			>
				{{ linkText }}
			</v-btn>
		</template>
		<v-row dense>
			<v-col cols="12" md="6">
				<div class="item-key">Código de compra</div>
				<div class="item-value">#{{ order.code }}</div>
			</v-col>
			<v-col cols="12" md="6">
				<div class="item-key">Fecha en que realizaste el pedido</div>
				<div class="item-value">
					{{ order.confirmedAt | datetime }}
				</div>
			</v-col>
			<v-col cols="12" md="6">
				<div class="item-key">Total de la compra</div>
				<div class="item-value">
					<PriceText :amount="order.total" zero-decimals style="font-size: 1.4rem" />
				</div>
			</v-col>
			<v-col cols="12" md="6">
				<div class="item-key">Estado del pago</div>
				<div class="item-value">
					<span v-if="paymentStatus == 'paid'">
						Tu pago se acreditó el día {{ order.paidAt | date }} a las {{ order.paidAt | time }}
					</span>
					<span v-else-if="paymentStatus == 'refunded'"> Se ha realizado la devolución de tu pago </span>
					<span v-else-if="mainStatus == 'canceled'"> Tu compra fue cancelada </span>
					<span v-else> Pendiente de pago </span>
				</div>
			</v-col>
			<v-col cols="12" v-if="delivery">
				<div class="item-key">Entrega de productos</div>
				<div class="item-value">{{ delivery.methodName }} - {{ delivery.optionName }}</div>
			</v-col>
		</v-row>
	</CardLayout>
</template>

<style scoped>
.item-key {
	padding: 2px 6px;
	font-weight: bold;
	background-color: #f3f3f3;
	border-radius: 4px;
	display: inline-block;
}
.item-value {
	padding: 6px 6px;
}
</style>
