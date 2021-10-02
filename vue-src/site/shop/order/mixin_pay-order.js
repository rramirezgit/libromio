export default {
	methods: {
		payOrderCall(order, apiCallOptions = {}) {
			this.$shopApi.get(`/order/${order.id}/payment`, {
				...apiCallOptions,
				done: ({ success, message }) => {
					if (success) return
					if (message.code == 'unexpected_payment' || message.code == 'already_paid') {
						location.href = this.$router.resolve({
							name: 'user.order-detail',
							params: { id: order.id },
						})
					} else {
						location.href = this.$router.resolve({ name: 'user.orders' })
					}
				},
			})
		},
	},
}
