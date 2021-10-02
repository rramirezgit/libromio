<script>
export default {
	name: 'CartTotals',
	props: {
		order: Object,
	},
	computed: {
		itemsName() {
			return 'Productos'
		},
		itemsAmount() {
			return this.order.items.reduce((sum, item) => sum + item.initTotal, 0)
		},
		itemsDiscountName() {
			return 'Descuento Productos'
		},
		itemsDiscountAmount() {
			return this.order.items.reduce((sum, item) => sum + item.discountTotal, 0)
		},
		extraItemsDiscountName() {
			return this.extraDiscountName
		},
		extraItemsDiscountAmount() {
			return this.order.discount?.itemsDiscount || 0
		},
		itemsSubtotalAmount() {
			return this.itemsAmount - this.itemsDiscountAmount - this.extraItemsDiscountAmount
		},
		deliveryName() {
			return this.order.delivery?.methodName
		},
		deliveryAmount() {
			return this.order.delivery?.cost
		},
		deliveryDiscountName() {
			return this.order.delivery?.discountName || 'Descuento envío'
		},
		deliveryDiscountAmount() {
			return this.order.delivery?.discount
		},
		extraDeliveryDiscountName() {
			return this.extraDiscountName
		},
		extraDeliveryDiscountAmount() {
			return this.order.discount?.deliveryDiscount || 0
		},
		extraDiscountName() {
			return this.order.discount?.discountName || ''
		},
		totalAmount() {
			return this.order.total
		},
	},
}
</script>

<template>
	<div>
		<template v-if="itemsDiscountAmount || extraItemsDiscountAmount">
			<v-divider />
			<v-list-item>
				<v-list-item-title class="primary--text" style="font-size: 1.4rem">
					{{ itemsName }}
				</v-list-item-title>
				<v-list-item-subtitle class="text-right primary--text" style="font-size: 1.4rem">
					<PriceText :amount="itemsAmount" />
				</v-list-item-subtitle>
			</v-list-item>
			<v-list-item v-if="itemsDiscountAmount">
				<v-list-item-title>{{ itemsDiscountName }}</v-list-item-title>
				<v-list-item-subtitle class="text-right error--text" style="font-size: 1.2rem">
					<PriceText :amount="-itemsDiscountAmount" />
				</v-list-item-subtitle>
			</v-list-item>
			<v-list-item v-if="extraItemsDiscountAmount">
				<v-list-item-title>{{ extraItemsDiscountName }}</v-list-item-title>
				<v-list-item-subtitle class="text-right error--text" style="font-size: 1.2rem">
					<PriceText :amount="-extraItemsDiscountAmount" />
				</v-list-item-subtitle>
			</v-list-item>
		</template>
		<template v-if="deliveryAmount">
			<v-divider />
			<v-list-item>
				<v-list-item-title class="primary--text" style="font-size: 1.4rem">
					Subtotal
				</v-list-item-title>
				<v-list-item-subtitle class="text-right primary--text" style="font-size: 1.4rem">
					<PriceText :amount="itemsSubtotalAmount" />
				</v-list-item-subtitle>
			</v-list-item>
			<v-list-item>
				<v-list-item-title>
					{{ deliveryName }}
				</v-list-item-title>
				<v-list-item-subtitle class="text-right" style="font-size: 1.2rem">
					<PriceText :amount="deliveryAmount" />
				</v-list-item-subtitle>
			</v-list-item>
			<v-list-item v-if="deliveryDiscountAmount">
				<v-list-item-title>
					{{ deliveryDiscountName }}
				</v-list-item-title>
				<v-list-item-subtitle class="text-right error--text" style="font-size: 1.2rem">
					<PriceText :amount="-deliveryDiscountAmount" />
				</v-list-item-subtitle>
			</v-list-item>
			<v-list-item v-if="extraDeliveryDiscountAmount">
				<v-list-item-title>
					{{ extraDeliveryDiscountName }}
				</v-list-item-title>
				<v-list-item-subtitle class="text-right error--text" style="font-size: 1.2rem">
					<PriceText :amount="-extraDeliveryDiscountAmount" />
				</v-list-item-subtitle>
			</v-list-item>
		</template>
		<v-divider />
		<v-list-item>
			<v-list-item-title class="primary--text" style="font-size: 2rem">Total</v-list-item-title>
			<v-list-item-subtitle class="text-right primary--text" style="font-size: 2rem">
				<PriceText :amount="totalAmount" />
			</v-list-item-subtitle>
		</v-list-item>
	</div>
</template>
