const { Op } = require('sequelize')
const moment = require('moment')
const { Cron } = require('#/utils')
const { db } = require('#/express')
const OrderManager = require('./services/order-manager')

Cron.create('Shop.unpaid-orders-cancelation', {
	title: 'Cancelación de órdenes impagas',
	cronTime: '0 0 */3 * * *',
	onTick: async () => {
		let orders = await db.Order.scope('full').findAll({
			where: {
				mainStatus: 'confirmed',
				paymentStatus: 'pending',
				confirmedAt: {
					[Op.lte]: moment()
						.subtract(72, 'hours')
						.toDate(),
				},
			},
		})
		for (let order of orders) {
			await new OrderManager(order).setMainStatus('canceled')
		}
	},
	//runOnInit: true,
})
