const { Router } = require('express')
const MPService = require('./mp-service')
const MercadoPagoMethod = require('./mercado-pago-method')
const { _try } = require('#/utils')
const { db } = require('#/express')
const { apiRouter: shopApiRouter } = require('#/shop')
const { OrderManager } = require('#/shop-order')

/*shopApiRouter.get(
	'/mp/preferences/:id&:quantity',
	authMid.ensureAuth(),
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromCartCookie(req, res, true)
		await orderMng.addItem({ refType: 'product', externalReference: req.params.id, qty: req.params.quantity })
		await orderMng.confirmOrder()
		let { mpId, initPoint, sandboxInitPoint } = await MPService.createPreference(orderMng)
		res.api.data({ mpId, initPoint, sandboxInitPoint }).json()
	})
)*/

for (let [callbackState, endpoint] of Object.entries(MPService.callbackEndpoints)) {
	shopApiRouter.get(
		endpoint,
		_try(async (req, res, next) => {
			let { status: mpStatus, payment_id: mpPaymentId, external_reference } = req.query

			let redirectUrl = '/user/orders'

			let paymentId = external_reference.replace(/^DBS-/, '')
			let orderPayment = await db.OrderPayment.findByPk(paymentId)
			if (!orderPayment) return res.redirect(redirectUrl)
			let orderMng = await OrderManager.fromId(orderPayment.orderId)
			if (!orderMng) return res.redirect(redirectUrl)

			redirectUrl = `/user/orders/${orderMng.order.id}`
			if (!mpPaymentId || mpPaymentId == 'null') return res.redirect(redirectUrl)
			let mpPaymentInfo = await MPService.getPaymentInfo(mpPaymentId)
			if (mpPaymentInfo.external_reference != external_reference) return res.redirect(redirectUrl)

			let paid = callbackState == 'success' && mpStatus == 'approved' && mpPaymentInfo.status == 'approved'
			if (paid) {
				await orderMng.paymentMethod.statusFlow.assign('paid', {
					data: {
						amount: mpPaymentInfo.transaction_amount,
						externalReference: mpPaymentId,
						externalData: mpPaymentInfo,
					},
				})
			}
			return res.redirect(redirectUrl)
		})
	)
}

const ipnMiddleware = _try(async (req, res, next) => {
	//let topic = req.query.topic
	let mpPaymentId = req.query.id || req.body.id

	//if (topic != 'payment') return next()
	let mpPaymentInfo = await MPService.getPaymentInfo(mpPaymentId)
	if (!mpPaymentInfo) return next()
	let paymentId = mpPaymentInfo.external_reference.replace(/^DBS-/, '')
	let orderPayment = await db.OrderPayment.findByPk(paymentId)
	if (!orderPayment) return next()
	let orderMng = await OrderManager.fromId(orderPayment.orderId)
	if (!orderMng) return next()

	let paid = mpPaymentInfo.status == 'approved'
	if (paid) {
		await orderMng.paymentMethod.statusFlow.assign('paid', {
			data: {
				amount: mpPaymentInfo.transaction_amount,
				externalReference: mpPaymentId,
				externalData: mpPaymentInfo,
			},
		})
	}

	next()
})

shopApiRouter.post('/mp/ipn', ipnMiddleware, (req, res, next) => res.status(200).send())
shopApiRouter.get('/mp/ipn', ipnMiddleware, (req, res, next) => res.status(200).send())
