const OrderManager = require('./services/order-manager')
const AddressService = require('./services/address-service')
const { MailerBuilder, Mailer } = require('#/mailer')
const { emitter } = require('#/utils')
const { basename, join } = require('path')

// BUILD ORDER BASIC --------------------------------------------------
const buildOrder = async (mailer, orderMng) => {
	let { order } = orderMng
	mailer.renderData({
		orderMng,
		order,
		getAddressLine: AddressService.getAddressLine,
	})
}

const buildOrderDetail = async (mailer, orderMng) => {
	let { order } = orderMng
	mailer.attach(
		order.items.map((item) => ({
			filename: basename(item.image),
			path: join('public', item.image),
			cid: `order-item-image-${item.id}`,
		}))
	)
}

// ADMINS --------------------------------------------------
MailerBuilder.register('admins.order', {
	use: ['admins.layout'],
	build: async (mailer, { orderMng }) => {
		await buildOrder(mailer, orderMng)
		mailer.to('fernando@drubbit.com')
	},
	serialize: ({ orderMng }) => {
		let orderId = orderMng.order.id
		return { orderId }
	},
	unserialize: async ({ orderId }) => {
		let orderMng = await OrderManager.fromId(orderId)
		return { orderMng }
	},
})

MailerBuilder.register('admins.order-detail', {
	use: ['admins.order'],
	build: async (mailer, { orderMng }) => {
		await buildOrderDetail(mailer, orderMng)
		mailer.subject(`Orden de compra #${orderMng.order.code}`)
		mailer.renderFile('shop/order/admins-order-detail')
	},
})

MailerBuilder.register('admins.order-status.paid', {
	use: ['admins.order'],
	build: async (mailer, { orderMng }) => {
		mailer.subject(`Orden de compra #${orderMng.order.code}`)
		mailer.renderFile('shop/order-statuses/admins-order-status--paid')
	},
})

// USERS --------------------------------------------------
MailerBuilder.register('users.order', {
	use: ['users.layout'],
	build: async (mailer, { orderMng }) => {
		await buildOrder(mailer, orderMng)
		let { order } = orderMng
		mailer.to(order.buyer.email)
	},
	serialize: ({ orderMng }) => {
		let orderId = orderMng.order.id
		return { orderId }
	},
	unserialize: async ({ orderId }) => {
		let orderMng = await OrderManager.fromId(orderId)
		return { orderMng }
	},
})

MailerBuilder.register('users.order-detail', {
	use: ['users.order'],
	build: async (mailer, { orderMng }) => {
		await buildOrderDetail(mailer, orderMng)
		mailer.subject(`Orden de compra #${orderMng.order.code}`)
		mailer.renderFile('shop/order/users-order-detail')
	},
})

MailerBuilder.register('users.order-status.paid', {
	use: ['users.order'],
	build: async (mailer, { orderMng }) => {
		mailer.subject(`Confirmación de pago`)
		mailer.renderFile('shop/order-statuses/users-order-status--paid')
	},
})

MailerBuilder.register('users.order-status.canceled', {
	use: ['users.order'],
	build: async (mailer, { orderMng }) => {
		mailer.subject(`Tu compra fue cancelada`)
		mailer.renderFile('shop/order-statuses/users-order-status--canceled')
	},
})

MailerBuilder.register('users.order-status.packing', {
	use: ['users.order'],
	build: async (mailer, { orderMng }) => {
		mailer.subject(`Estamos preparando tu paquete`)
		mailer.renderFile('shop/order-statuses/users-order-status--packing')
	},
})

MailerBuilder.register('users.order-status.ready', {
	use: ['users.order'],
	build: async (mailer, { orderMng }) => {
		mailer.subject(`Ya podés retirar tu pedido #${orderMng.order.code}`)
		mailer.renderFile('shop/order-statuses/users-order-status--ready')
	},
})

MailerBuilder.register('users.order-status.sent', {
	use: ['users.order'],
	build: async (mailer, { orderMng }) => {
		mailer.subject(`Despachamos tu compra`)
		mailer.renderFile('shop/order-statuses/users-order-status--sent')
	},
})

MailerBuilder.register('users.order-status.delivered', {
	use: ['users.order'],
	build: async (mailer, { orderMng }) => {
		mailer.subject(`Tu compra fue entregada`)
		mailer.renderFile('shop/order-statuses/users-order-status--delivered')
	},
})

emitter.on('Order.MAIN_STATUS', async ({ orderMng, mainStatus, t }) => {
	let { order } = orderMng
	let { user } = orderMng.order
	if (mainStatus == 'confirmed') {
		t.afterCommit(async () => {
			await Mailer.buildAndSend('users.order-detail', { user, orderMng })
			await Mailer.buildAndSend('admins.order-detail', { orderMng })
		})
	} else if (mainStatus == 'canceled' && order.paymentStatus == 'pending') {
		t.afterCommit(async () => {
			await Mailer.buildAndSend('users.order-status.canceled', { user, orderMng })
		})
	}
})

emitter.on('Order.PAYMENT_STATUS', async ({ orderMng, paymentStatus, t }) => {
	let { order } = orderMng
	let { user } = order
	if (paymentStatus == 'paid') {
		t.afterCommit(async () => {
			await Mailer.buildAndSend('users.order-status.paid', { user, orderMng })
			await Mailer.buildAndSend('admins.order-status.paid', { orderMng })
		})
	}
})

emitter.on('Order.MAKING_STATUS', async ({ orderMng, makingStatus, t }) => {
	let { order } = orderMng
	let { user } = order
	if (makingStatus == 'packing' || makingStatus == 'ready') {
		t.afterCommit(async () => {
			await Mailer.buildAndSend(`users.order-status.${makingStatus}`, { user, orderMng })
		})
	}
})

emitter.on('Order.DELIVERY_STATUS', async ({ orderMng, deliveryStatus, t }) => {
	let { order } = orderMng
	let { user } = order
	if (deliveryStatus == 'delivered') {
		t.afterCommit(async () => {
			await Mailer.buildAndSend(`users.order-status.delivered`, { user, orderMng })
		})
	}
})

emitter.on('Order.delivery.STATUS', async ({ orderMng, status, t }) => {
	let { order } = orderMng
	let { user } = order
	if (status == 'sent') {
		t.afterCommit(async () => {
			await Mailer.buildAndSend(`users.order-status.sent`, { user, orderMng })
		})
	}
})
