export default {
	methods: {
		calculateSummary(order) {
			return {
				get itemsName() {
					return 'Productos'
				},
				get itemsAmount() {
					return order.items.reduce((sum, item) => sum + item.initTotal, 0)
				},
				get itemsDiscountName() {
					return 'Descuento Productos'
				},
				get itemsDiscountAmount() {
					return order.items.reduce((sum, item) => sum + item.discountTotal, 0)
				},
				get extraItemsDiscountName() {
					return this.extraDiscountName
				},
				get extraItemsDiscountAmount() {
					return order.discount?.itemsDiscount || 0
				},
				get itemsSubtotalAmount() {
					return this.itemsAmount - this.itemsDiscountAmount - this.extraItemsDiscountAmount
				},
				get deliveryName() {
					return order.delivery?.methodName
				},
				get deliveryAmount() {
					return order.delivery?.cost
				},
				get deliveryDiscountName() {
					return order.delivery?.discountName || 'Descuento envío'
				},
				get deliveryDiscountAmount() {
					return order.delivery?.discount
				},
				get extraDeliveryDiscountName() {
					return this.extraDiscountName
				},
				get extraDeliveryDiscountAmount() {
					return order.discount?.deliveryDiscount || 0
				},
				get extraDiscountName() {
					return order.discount?.discountName || ''
				},
				get totalAmount() {
					return order.total
				},
			}
		},
	},
}
