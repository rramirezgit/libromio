<script>
import addressHelperMixin from '@/__shared/shop/mixin_address-helper'
import orderHelperMixin from '@/__shared/shop/mixin_order-helper'
import { compsFromContext } from '@/__shared/utils/lib_utils'

const orderDetailComps = Object.keys(
	compsFromContext(require.context('@/admin', true, /comp_OrderDetail[\w-]+\.vue$/))
)
console.log(orderDetailComps)

export default {
	name: 'OrderDetail',
	mixins: [addressHelperMixin, orderHelperMixin],
	props: {
		orderId: String,
	},
	data() {
		return {
			order: null,
			loading: false,
			activeUser: null,
			orderDetailComps,
			activeStatusData: null,
		}
	},
	watch: {
		orderId() {
			this.loadOrder()
		},
	},
	computed: {
		statusesInfo() {
			return this.order.statusesInfo
		},
		deliveryAddress() {
			return this.order.delivery?.data?.address
		},
		summary() {
			return this.calculateSummary(this.order)
		},
	},
	methods: {
		async loadOrder() {
			await this.$adminApi.get({
				url: `/sales/order/${this.orderId}`,
				loading: (v) => (this.loading = v),
				onSuccess: ({ data }) => {
					this.order = data.order
				},
			})
		},
		copyToClipboard(str) {
			navigator.clipboard.writeText(str)
		},
		getStatusClass(status) {
			// prettier-ignore
			return `d-inline px-2 py-1 text-subtitle-2 font-weight-regular rounded ${status.color} lighten-5 ${status.color}--text text--darken-3`
		},
		openStatusDialog(statusType, title) {
			this.activeStatusData = { statusType, orderId: this.orderId, title }
		},
		updateOrder() {
			setTimeout(
				function () {
					this.loadOrder()
				}.bind(this),
				500
			)
		},
	},
	provide: {
		reloadOrder(order) {
			if (order) this.order = order
			else this.loadOrder()
		},
	},
	created() {
		this.loadOrder()
	},
}
</script>

<template>
	<div>
		<div v-if="loading" class="text-center">
			<div class="text-h6 py-10">Cargando detalle de la orden</div>
			<v-progress-circular indeterminate color="primary" size="48" />
		</div>
		<div v-else-if="order" class="order-main-container">
			<!-- ORDER INFO -->
			<row>
				<c md="7">
					<Subtitle text="Datos generales" />
					<v-card>
						<v-simple-table>
							<tbody>
								<tr>
									<td class="text-no-wrap"><b>Código de compra</b></td>
									<td>
										#{{ order.code }}
										<Button icon @click="copyToClipboard(order.code)">
											<v-icon small>mdi-content-copy</v-icon>
										</Button>
									</td>
								</tr>
								<tr v-if="order.discount">
									<td class="text-no-wrap"><b>Descuento aplicado</b></td>
									<td>{{ order.discount.discountName }}</td>
								</tr>
								<tr v-if="order.delivery">
									<td class="text-no-wrap"><b>Método de Entrega</b></td>
									<td>
										{{ order.delivery.methodName }}<br />
										{{ order.delivery.optionName }}
									</td>
								</tr>
								<tr v-if="deliveryAddress">
									<td><b>Domicilio de entrega</b></td>
									<td>
										{{ getAddressLine(deliveryAddress) }}
									</td>
								</tr>
								<tr>
									<td>
										<b>Usuario / Contacto</b>
									</td>
									<td>
										<div>{{ order.buyer.firstname }} {{ order.buyer.lastname }}</div>
										<div>{{ order.buyer.email }}</div>
										<div>({{ order.buyer.phonePrefix }}) {{ order.buyer.phoneNumber }}</div>
										<div class="pt-2">
											<Button x-small color="primary" @click="activeUser = order.user">
												Ver usuario
											</Button>
										</div>
									</td>
								</tr>
								<tr>
									<td><b>Facturación</b></td>
									<td v-if="order.invoice.business">
										{{ order.invoice.businessName }}<br />
										CUIT {{ order.invoice.businessIdNumber }}<br />
										Factura {{ order.invoice.invoiceType }}<br />
										{{ getAddressLine(order.invoiceAddress) }}
									</td>
									<td v-else>
										{{ order.invoice.personLastname }}, {{ order.invoice.personFirstname }}<br />
										DNI {{ order.invoice.personIdNumber }}<br />
										{{ getAddressLine(order.invoiceAddress) }}
									</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-card>
				</c>
				<c md="5">
					<Subtitle text="Estado de la orden" />
					<v-card>
						<v-simple-table>
							<tbody>
								<tr>
									<td><b>Estado general</b></td>
									<td class="text-right">
										<span
											@click="openStatusDialog('main', 'general')"
											:class="getStatusClass(statusesInfo.main)"
											class="cursor-pointer"
											>{{ statusesInfo.main.name }}</span
										>
									</td>
								</tr>
								<tr>
									<td><b>Fecha de confirmación</b></td>
									<td class="text-right">{{ order.confirmedAt | datetime }}</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-card>
					<v-card>
						<v-simple-table>
							<tbody>
								<tr>
									<td>
										<b>Estado de {{ order.payments[0].methodName }}</b>
										<div>{{ order.payments[0].optionName }}</div>
									</td>
									<td class="text-right">
										<span
											@click="openStatusDialog('paymentmethod', order.payments[0].methodName)"
											:class="`cursor-pointer ${getStatusClass(statusesInfo.paymentMethod)}`"
											class="pointer"
											>{{ statusesInfo.paymentMethod.name }}</span
										>
									</td>
								</tr>
								<tr v-if="order.paidAt">
									<td><b>Fecha de pago</b></td>
									<td class="text-right">{{ order.paidAt | datetime }}</td>
								</tr>
								<tr v-if="order.totalPaid > 0">
									<td><b>Total pagado</b></td>
									<td class="text-right">{{ order.totalPaid | price }}</td>
								</tr>
								<tr v-if="order.payments[0].externalReference">
									<td><b>Referencia externa del pago</b></td>
									<td class="text-right">{{ order.payments[0].externalReference }}</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-card>
					<v-card>
						<v-simple-table>
							<tbody>
								<tr>
									<td><b>Estado de producción</b></td>
									<td class="text-right">
										<span
											@click="openStatusDialog('making', 'producción')"
											:class="`cursor-pointer ${getStatusClass(statusesInfo.making)}`"
											class="pointer"
										>
											{{ statusesInfo.making.name }}
										</span>
									</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-card>
					<v-card v-if="order.delivery">
						<v-simple-table>
							<tbody>
								<tr>
									<td>
										<b>Estado de {{ order.delivery.methodName }}</b>
										<div>{{ order.delivery.optionName }}</div>
									</td>
									<td class="text-right">
										<span
											@click="openStatusDialog('deliverymethod', order.delivery.methodName)"
											:class="`cursor-pointer ${getStatusClass(statusesInfo.deliveryMethod)}`"
											>{{ statusesInfo.deliveryMethod.name }}</span
										>
									</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-card>
				</c>
			</row>
			<!-- ORDER SUMMARY -->
			<row>
				<c>
					<Subtitle text="Resumen de compra" />
					<v-card>
						<v-simple-table>
							<thead>
								<tr>
									<th>Producto</th>
									<th>Precio</th>
									<th>Descuento</th>
									<th>Cantidad</th>
									<th>Subtotal</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="item of order.items" :key="item.id">
									<td>
										<div class="d-flex align-center">
											<v-img
												:src="item.image"
												aspect-ratio="1"
												max-width="70"
												class="rounded"
												style="border 1px #ddd"
											/>
											<div class="ml-2">
												{{ item.name }}
												<div class="grey--text">{{ item.variantName }}</div>
												<small class="d-inline pa-1 grey lighten-4 grey--text text--darken-3">
													SKU {{ item.sku }}
												</small>
											</div>
										</div>
									</td>
									<td class="text-no-wrap">
										<div v-if="item.discountPct">
											<del>{{ item.initPrice | price }}</del>
										</div>
										<div>{{ item.price | price }}</div>
									</td>
									<td>
										<div v-if="item.discountPct">
											{{ item.discountName }}
											<div class="text-no-wrap">{{ item.discountPct }}% OFF</div>
										</div>
										<span v-else>-</span>
									</td>
									<td class="text-no-wrap">{{ item.qty }} unid.</td>
									<td>
										<div class="text-no-wrap">
											<b>{{ item.total | price }}</b>
										</div>
										<small
											v-if="order.discount && item.reachedByOrderDiscount"
											class="
												d-inline-block
												success
												lighten-5
												success--text
												text--darken-2
												px-2
												py-1
												font-weight-bold
												text-center
											"
										>
											{{ order.discount.discountName }}<br />
											{{ -item.orderDiscountTotal | price }}
										</small>
									</td>
								</tr>
								<tr>
									<td colspan="4" class="text-h6 text-right">{{ summary.itemsName }}</td>
									<td>{{ summary.itemsAmount | price }}</td>
								</tr>
								<tr v-if="summary.itemsDiscountAmount">
									<td colspan="4" class="text-subtitle-1 text-right">
										{{ summary.itemsDiscountName }}
									</td>
									<td>{{ -summary.itemsDiscountAmount | price }}</td>
								</tr>
								<tr v-if="summary.extraItemsDiscountAmount">
									<td colspan="4" class="text-subtitle-1 text-right">
										{{ summary.extraItemsDiscountName }}
									</td>
									<td>{{ -summary.extraItemsDiscountAmount | price }}</td>
								</tr>
								<tr v-if="summary.deliveryAmount">
									<td colspan="4" class="text-subtitle-1 text-right">
										{{ summary.deliveryName }}
									</td>
									<td>{{ summary.deliveryAmount | price }}</td>
								</tr>
								<tr v-if="summary.deliveryDiscountAmount">
									<td colspan="4" class="text-subtitle-1 text-right">
										{{ summary.deliveryDiscountName }}
									</td>
									<td>{{ -summary.deliveryDiscountAmount | price }}</td>
								</tr>
								<tr v-if="summary.extraDeliveryDiscountAmount">
									<td colspan="4" class="text-subtitle-1 text-right">
										{{ summary.extraDeliveryDiscountName }}
									</td>
									<td>{{ -summary.extraDeliveryDiscountAmount | price }}</td>
								</tr>
								<tr>
									<td colspan="4" class="text-h5 text-right">Total</td>
									<td class="text-h5">{{ summary.totalAmount | price }}</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-card>
				</c>
			</row>
			<!-- ORDER EXTRA INFO -->
			<component v-for="compName of orderDetailComps" :key="compName" :is="compName" :order="order" />
		</div>
		<StatusesDialog v-model="activeStatusData" @updateOrder="updateOrder" />
		<RegisteredUsersDialog v-model="activeUser" />
	</div>
</template>

<style scoped>
.v-data-table >>> td {
	padding-top: 12px !important;
	padding-bottom: 12px !important;
}
.order-main-container >>> .v-card {
	margin-top: 22px !important;
	margin-bottom: 22px !important;
}
</style>
