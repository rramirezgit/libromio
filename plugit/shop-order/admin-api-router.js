const { Router } = require('express')
const OrderService = require('./services/order-service')
const OrderManager = require('./services/order-manager')
const { db } = require('#/express')
const { _try } = require('#/utils')
const {
	authMids: { ensurePermission },
	apiRouter: adminApiRouter,
} = require('#/admin')

const router = Router()
adminApiRouter.use('/sales', ensurePermission('sales'), router)

// ORDERS
router.get(
	'/orders',
	_try(async (req, res, next) => {
		let { orders, pagination } = await OrderService.getAll({
			...req.query,
			onlyCarts: false,
			sortDesc: req.query.sortDesc == 'true',
			scope: req.query.scope || 'list',
		})
		for (let order of orders) new OrderManager(order).includeStatusesInfo()
		res.api.data({ orders, pagination }).json()
	})
)

router.get(
	'/order/:id',
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromId(req.params.id)
		if (orderMng) orderMng.includeStatusesInfo()
		let { order = null } = orderMng || {}
		res.api.data({ order }).json()
	})
)

router.get(
	'/order/:id/paymentmethodstatuses',
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromId(req.params.id)
		let statuses = await orderMng.paymentMethod.statusFlow.getAllAssignableStatuses({ manualMode: true })
		res.api.data({ statuses }).json()
	})
)

router.get(
	'/order/:id/deliverymethodstatuses',
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromId(req.params.id)
		let statuses = await orderMng.deliveryMethod.statusFlow.getAllAssignableStatuses({ manualMode: true })
		res.api.data({ statuses }).json()
	})
)

router.get(
	'/order/:id/mainstatuses',
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromId(req.params.id)
		let statuses = await orderMng.mainStatusFlow.getAllAssignableStatuses({ manualMode: true })
		res.api.data({ statuses }).json()
	})
)

router.get(
	'/order/:id/makingstatuses',
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromId(req.params.id)
		let statuses = await orderMng.makingStatusFlow.getAllAssignableStatuses({ manualMode: true })
		res.api.data({ statuses }).json()
	})
)

router.put(
	'/order/:id/updatepaymentmethodstatus',
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromId(req.params.id)
		let apiRes = orderMng.paymentMethod.statusFlow.assign(req.body.key, { manualMode: true })
		res.api.data(apiRes).json()
	})
)

router.put(
	'/order/:id/updatedeliverymethodstatus',
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromId(req.params.id)
		let apiRes = orderMng.deliveryMethod.statusFlow.assign(req.body.key, { manualMode: true })
		res.api.data({ apiRes }).json()
	})
)

router.put(
	'/order/:id/updatemakingstatus',
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromId(req.params.id)
		let apiRes = orderMng.makingStatusFlow.assign(req.body.key, { manualMode: true })
		res.api.data({ apiRes }).json()
	})
)

router.put(
	'/order/:id/updatemainstatus',
	_try(async (req, res, next) => {
		let orderMng = await OrderManager.fromId(req.params.id)
		let apiRes = orderMng.mainStatusFlow.assign(req.body.key, { manualMode: true })
		res.api.data({ apiRes }).json()
	})
)
