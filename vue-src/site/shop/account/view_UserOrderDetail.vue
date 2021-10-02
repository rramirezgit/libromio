<script>
import payOrderMixin from '@/site/shop/order/mixin_pay-order'

export default {
	mixins: [payOrderMixin],
	data() {
		return {
			order: null,
			loading: false,
			cardLinkLoading: false,
		}
	},
	computed: {
		isPaid() {
			return this.order?.paymentStatus == 'paid'
		},
		canPay() {
			return this.order?.mainStatus == 'confirmed' && this.order?.paymentStatus == 'pending'
		},
		cardLink() {
			if (this.canPay) {
				return {
					text: 'Realizar pago',
					action: () => this.payOrder(),
				}
			}
			return { text: null, action: () => {} }
		},
	},
	methods: {
		loadOrder() {
			this.$shopApi.get({
				url: `/user/order/${this.$route.params.id}`,
				loading: (v) => (this.loading = v),
				onSuccess: ({ data, options }) => {
					if (!data.order) {
						options.abort()
						this.$router.replace({ name: 'user.orders' })
						return
					}
					this.order = data.order
				},
			})
		},
		payOrder() {
			if (!this.canPay) return
			this.payOrderCall(this.order, {
				loading: (v) => (this.cardLinkLoading = v),
			})
		},
	},
	created() {
		this.loadOrder()
	},
}
</script>

<template>
	<UserpanelLayout title="Detalle de la compra">
		<div v-if="loading" class="d-flex align-center justify-center py-16">
			<v-progress-circular size="50" indeterminate color="primary" />
			<div class="ml-4">Cargando el detalle de la compra</div>
		</div>
		<template v-else>
			<v-row>
				<v-col cols="12">
					<OrderListCard
						:order="order"
						:link-text="cardLink.text"
						@linkClick="cardLink.action"
						:link-loading="cardLinkLoading"
					/>
				</v-col>
				<v-col cols="12" v-if="canPay">
					<PaymentInstructions :order="order" />
				</v-col>
				<v-col cols="12" v-if="canPay">
					<PaymentConfirm :order="order" />
				</v-col>
				<v-col cols="12" v-if="isPaid">
					<OrderDigitalItemsCard :order="order" />
				</v-col>
				<v-col cols="12" v-if="order.delivery">
					<DeliveryConfirm :order="order" />
				</v-col>
			</v-row>
			<v-row>
				<v-col cols="12" md="5">
					<v-row>
						<v-col cols="12">
							<DiscountConfirm :order="order" />
						</v-col>
						<v-col cols="12">
							<ContactConfirm :order="order" />
						</v-col>
					</v-row>
				</v-col>
				<v-col cols="12" md="7">
					<OrderSummary :order="order" />
				</v-col>
			</v-row>
		</template>
	</UserpanelLayout>
</template>

<style></style>
