const moment = require('moment')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const { db, KeyValueService } = require('#/express')
const { ConfigService } = require('#/admin')
const OrderItemAdaptor = require('./order-item-adaptor')
const { emitter, ApiRes, v } = require('#/utils')
const { Op } = require('sequelize')
const MainStatusFlow = require('../statuses/main-status-flow')
const PaymentStatusFlow = require('../statuses/payment-status-flow')
const MakingStatusFlow = require('../statuses/making-status-flow')
const DeliveryStatusFlow = require('../statuses/delivery-status-flow')
const DeliveryService = require('./delivery-service')
const PaymentService = require('./payment-service')

class OrderManager {
	// STATIC
	static async fromId(id, userId) {
		let order = await db.Order.scope('full').findByPk(id)
		if (order && userId && order.userId != userId) {
			return null
		} else {
			return order ? new this(order) : null
		}
	}

	static _buildEmptyOrder() {
		return db.Order.$buildFromScope('full', {
			mainStatus: 'cart',
			paymentStatus: 'pending',
			makingStatus: 'pending',
			deliveryStatus: 'pending',
			totalPaid: 0,
			total: 0,
			items: [],
			payments: [],
		})
	}

	// CONSTRUCTOR
	constructor(fullScopedOrder = null) {
		this._order = fullScopedOrder || OrderManager._buildEmptyOrder()
		this._resetItemsData()
		this._autoModified = false
		this._simulation = false
	}

	_resetItemsData() {
		this._itemsData = this._order.items.map((item) => ({
			refId: item.refId,
			refType: item.refType,
			qty: item.qty,
		}))
	}

	get order() {
		return this._order
	}

	get items() {
		return this._order.items
	}

	get itemsData() {
		return this._itemsData
	}

	get autoModified() {
		return this._autoModified
	}

	get empty() {
		return this._order.items.length == 0
	}

	get hasUser() {
		return !!this._order.userId
	}

	get isNew() {
		return this._order.isNewRecord
	}

	simulationMode(b) {
		this._simulation = b
	}

	/**
	 * @param {{refType: string, refId: string, qty: number}} itemData
	 * @param {{sumQty: boolean}} options
	 */
	addItem(itemData, options = {}) {
		let { refType, refId, qty } = itemData
		let { sumQty = false } = options

		let currItemData = this._itemsData.find(
			(_itemData) => _itemData.refType == refType && _itemData.refId == refId
		)
		qty = isNaN(qty) || qty < 1 ? 1 : qty
		if (currItemData) {
			if (sumQty) currItemData.qty += qty
			else currItemData.qty = qty
		} else {
			this._itemsData.push({ refType, refId, qty })
		}
		return this
	}

	/**
	 * @param {{refType: string, refId: string}} itemData
	 */
	removeItem(itemData) {
		let { refType, refId } = itemData
		let idx = this._itemsData.findIndex(
			(_itemData) => _itemData.refType == refType && _itemData.refId == refId
		)
		if (idx >= 0) this._itemsData.splice(idx, 1)
		return this
	}

	/**
	 * @param {Array<{refType: string, refId: string, qty: number}>} itemsData
	 */
	setItems(itemsData) {
		this._itemsData = itemsData
		return this
	}

	/**
	 * @param {boolean}} save
	 * @param {{validateQty: boolean}} options
	 * @returns {Promise<void>}
	 */
	async refresh(options = {}) {
		let { validateQty = false } = options
		let order = this._order
		let freshItems = []

		this._autoModified = false
		let context = { orderDiscount: this._order.discount }

		for (let itemData of this._itemsData) {
			let adaptor = new OrderItemAdaptor(itemData.refType, itemData.refId, itemData.qty, context)
			let result = await adaptor.build({ validateQty })
			let currItem = order.items.find(
				({ refType, refId }) => itemData.refType == refType && itemData.refId == refId
			)

			if (result) {
				let { orderItem: freshItem, qtyChanged } = result
				if (qtyChanged) this._autoModified = true

				if (currItem) {
					currItem.set(freshItem.get())
					currItem.adaptor = adaptor
					freshItems.push(currItem)
				} else {
					freshItem.adaptor = adaptor
					freshItems.push(freshItem)
				}
			} else {
				this._autoModified = true
			}
		}

		order.items = freshItems
		this._resetItemsData()

		this._refreshTotal()

		if (!this._simulation) {
			await this._refreshSave()
		}

		return this
	}

	_refreshItemsDiscounts() {
		let { discount } = this._order
		let discountConfig = discount?.discountConfig
		if (!discountConfig) return

		discount.itemsDiscount = 0

		let { itemsCombinationMode, itemsLimitMode, itemsDiscountLimit, itemsDiscountPct } = discountConfig
		for (let item of this.items) {
			item.orderDiscountTotal = 0
			if (itemsCombinationMode == 'none') {
				item.discountPct = 0
				item.discount = 0
				item.discountTotal = 0
				item.discountName = null
				item.price = item.initPrice
				item.total = item.initTotal
			}

			let unitDiscount = Number((item.price * (itemsDiscountPct / 100)).toFixed(2))
			let totalDiscount = Number((unitDiscount * item.qty).toFixed(2))

			if (itemsDiscountLimit) {
				if (itemsLimitMode == 'per_unit') {
					unitDiscount = Math.min(unitDiscount, itemsDiscountLimit)
					totalDiscount = Number((unitDiscount * item.qty).toFixed(2))
				} else if (itemsLimitMode == 'per_item') {
					totalDiscount = Math.min(totalDiscount, itemsDiscountLimit)
				}
			}

			item.orderDiscountTotal = totalDiscount
			discount.itemsDiscount += totalDiscount
		}
		if (itemsDiscountLimit && itemsLimitMode == 'all') {
			discount.itemsDiscount = Math.min(discount.itemsDiscount, itemsDiscountLimit)
			let itemsTotal = this.items.reduce((sum, item) => sum + item.total, 0)
			for (let item of this.items) {
				if (!item.reachedByOrderDiscount) continue
				item.orderDiscountTotal = Number((discount.itemsDiscount * (item.total / itemsTotal)).toFixed(2))
			}
		}
	}

	_refreshTotal() {
		this._refreshItemsDiscounts()

		let order = this._order
		let total = 0

		let itemsTotal = order.items.reduce((sum, item) => sum + item.total, 0)
		itemsTotal -= order.discount?.itemsDiscount || 0
		total += Math.max(0, itemsTotal)

		let deliveryTotal = order.delivery?.total || 0

		let { discount } = order
		let discountConfig = discount?.discountConfig
		if (discountConfig) {
			let { deliveryDiscountPct, deliveryDiscountLimit } = discountConfig
			discount.deliveryDiscount = 0
			if (deliveryDiscountPct && deliveryTotal) {
				discount.deliveryDiscount = Number((deliveryTotal * (deliveryDiscountPct / 100)).toFixed(2))
				if (deliveryDiscountLimit) {
					discount.deliveryDiscount = Math.min(discount.deliveryDiscount, deliveryDiscountLimit)
				}
				deliveryTotal -= discount.deliveryDiscount
			}
		}

		total += Math.max(0, deliveryTotal)

		if (discountConfig) {
			let { fullOrderDiscountPct, fullOrderDiscountLimit } = discountConfig
			discount.fullOrderDiscount = 0
			if (fullOrderDiscountPct && total) {
				discount.fullOrderDiscount = Number((total * (fullOrderDiscountPct / 100)).toFixed(2))
				if (fullOrderDiscountLimit) {
					discount.fullOrderDiscount = Math.min(discount.fullOrderDiscount, fullOrderDiscountLimit)
				}
				total -= discount.fullOrderDiscount
			}
		}

		order.total = Math.max(0, total)
	}

	async _refreshSave() {
		if (!this._order.isCart) return this

		await db.$transaction(async (t) => {
			let order = this._order
			let isNew = order.isNewRecord
			let managedEvent = emitter.managedEvent('Order.@REFRESH')

			managedEvent.onEmit(async ({ t }) => {
				let changed = order.changed()
				if (changed) await order.save()
				if (changed) {
					let subEvent = isNew ? 'CREATE' : 'UPDATE'
					await emitter.emit('Order.SAVE', { id: order.id, changed, subEvent, managedEvent, t })
				}
				managedEvent.data({ orderId: order.id })
			})

			for (let item of order.items) {
				let saveItem = item.changed() || !item.id
				if (!saveItem) continue
				managedEvent.onEmit(async ({ orderId, t }) => {
					let { qty } = item
					let qtyDiff = qty - (item.previous('qty') || 0)
					let subEvent = item.id ? 'UPDATE' : 'CREATE'
					saveItem && (await item.set({ orderId }).save())
					// prettier-ignore
					await emitter.emit('OrderItem.SAVE', { id: item.id, qty, qtyDiff, subEvent, managedEvent, t })
					if (subEvent == 'CREATE') {
						// prettier-ignore
						await emitter.emit('Order.items.SET', { id: orderId, itemId: item.id, subEvent: 'ADD', managedEvent, t })
					}
				})
			}

			if (!isNew) {
				managedEvent.onEmit(async ({ orderId, t }) => {
					let currIds = order.items.map(({ id }) => id)
					let orderItems = await db.OrderItem.findAll({
						where: { orderId, id: { [Op.notIn]: currIds } },
						attributes: ['id', 'qty'],
					})
					for (let orderItem of orderItems) {
						let deleteEvent = emitter.managedEvent('OrderItem.DELETE')
						// prettier-ignore
						await emitter.emit('OrderItem.BEFORE_DELETE', { id: orderItem.id, managedEvent, deleteEvent, t })
						await orderItem.destroy()
						await deleteEvent.emit({ id: orderItem.id, managedEvent, t })
						// prettier-ignore
						await emitter.emit('Order.items.SET', { id: orderId, itemId: orderItem.id, subEvent: 'REMOVE', managedEvent, t })
					}
				})
			}

			if (!order.items.length) {
				managedEvent.onEmit(async ({ t }) => {
					await this._delete(managedEvent)
				})
			}

			await managedEvent.emit({ t })
		})

		return this
	}

	async _delete(managedEvent = null) {
		if (!this._order.isCart || this._order.isNewRecord) return this
		await db.$transaction(async (t) => {
			const deleteEvent = emitter.managedEvent('Order.DELETE')
			await emitter.emit('Order.BEFORE_DELETE', { id: this._order.id, deleteEvent, managedEvent, t })
			await this._order.destroy()
			await deleteEvent.emit({ id: this._order.id, managedEvent, t })
			this._order = OrderManager._buildEmptyOrder()
			this._resetItemsData()
		})
		return this
	}

	async confirmOrder() {
		if (this._simulation) return
		await this._saveOrderCode()
		await db.$transaction(async (t) => {
			await this._saveOrderItemsImages()
			await this._order.buyer.save()
			await this._order.delivery?.save()
			await this._order.discount?.save()
			await this.setMainStatus('confirmed')
		})
	}

	get mainStatusFlow() {
		return new MainStatusFlow(this)
	}

	get paymentStatusFlow() {
		return new PaymentStatusFlow(this)
	}

	get makingStatusFlow() {
		return new MakingStatusFlow(this)
	}

	get deliveryStatusFlow() {
		return new DeliveryStatusFlow(this)
	}

	get deliveryMethod() {
		return this._order.delivery ? DeliveryService.getMethod(this._order.delivery.methodKey, this) : null
	}

	get paymentMethod() {
		return PaymentService.getMethod(this._order.payments[0].methodKey, this)
	}

	async setMainStatus(statusKey) {
		if (this._simulation) return
		return await this.mainStatusFlow.assign(statusKey)
	}

	async setPaymentStatus(statusKey) {
		if (this._simulation) return
		return await this.paymentStatusFlow.assign(statusKey)
	}

	async setMakingStatus(statusKey) {
		if (this._simulation) return
		return await this.makingStatusFlow.assign(statusKey)
	}

	async setDeliveryStatus(statusKey) {
		if (this._simulation) return
		return await this.deliveryStatusFlow.assign(statusKey)
	}

	/**
	 * @param {number} userId
	 * @returns {Promise<Object>} apiRes
	 */
	async setUser(userId) {
		let apiRes = ApiRes()
		if (!this._order.isCart) return apiRes.error(null)
		if (this._order.userId && this._order.userId == userId) return apiRes
		let user = await db.User.findByPk(userId)
		if (!user) return apiRes.error('El usuario es inexistente').validation('userId', 'Inválido')
		this._order.userId = userId
		this._order.user = user
		if (!this._simulation) await this._order.save()
		return apiRes
	}

	/**
	 * @param {{
	 * 	id?: string,
	 * 	methodKey: string,
	 * 	methodName: string,
	 * 	optionKey: string,
	 * 	optionName: string,
	 * 	data: {},
	 * 	amount: number,
	 * 	status: string,
	 * 	paid: boolean,
	 * 	externalData: {},
	 * 	externalReference: string,
	 * }} data
	 * @returns {Promise<Object>} payment
	 */
	async savePayment(data = {}) {
		let isNew = !data.id
		let payment = isNew
			? db.OrderPayment.build({ orderId: this._order.id })
			: this._order.payments.find((payment) => payment.id == data.id)

		let props = {
			methodKey: null,
			methodName: null,
			optionKey: null,
			optionName: null,
			data: null,
			amount: null,
			status: null,
			paid: false,
			refunded: false,
			externalData: null,
			externalReference: null,
		}
		if (isNew) _.defaults(data, props)
		data = _.pickBy(data, (v, k) => k in props)

		if (payment.paid) delete data.paid
		if (data.paid && !payment.paidAt) data.paidAt = moment()

		if (payment.refunded) delete data.refunded
		if (data.refunded && !payment.refundedAt) data.refundedAt = moment()

		payment.set(data)

		if (isNew) this._order.payments.push(payment)

		let changed = payment.changed()
		if (!changed) return payment

		this._refreshTotal()
		if (this._simulation) return payment

		return await db.$transaction(async (t) => {
			let subEvent = isNew ? 'CREATE' : 'UPDATE'
			await payment.save()
			await this._order.save()
			await emitter.emit('OrderPayment.SAVE', { orderMng: this, payment, changed, subEvent, t })
			if (
				(changed.includes('paid') && payment.paid) ||
				(changed.includes('refunded') && payment.refunded)
			) {
				await this._checkPaidPaymentsSum()
				await emitter.emit('OrderPayment.PAID', { orderMng: this, payment, t })
			}
			return payment
		})
	}

	async _checkPaidPaymentsSum() {
		let payments = await db.OrderPayment.findAll({ where: { orderId: this._order.id, paid: true } })
		let totalPaid = payments.reduce((sum, payment) => {
			return payment.refunded ? sum : sum + payment.amount
		}, 0)
		this._order.set({ totalPaid })
		let diff = Math.round(this._order.total - totalPaid)
		if (diff <= 0) {
			await this.setPaymentStatus('paid')
		} else if (totalPaid > 0) {
			await this.setPaymentStatus('partiallyPaid')
		} else {
			let totalRefunded = payments.reduce((sum, payment) => {
				return payment.refunded ? sum + payment.amount : sum
			}, 0)
			let diff = Math.round(this._order.total - totalRefunded)
			if (diff <= 0) {
				await this.setPaymentStatus('refunded')
			}
		}
	}

	/**
	 * @param {{
	 * 	id?: string,
	 * 	methodKey: string,
	 * 	methodName: string,
	 * 	optionKey: string,
	 * 	optionName: string,
	 * 	data: {},
	 * 	cost: number,
	 * 	discount: number,
	 * 	discountName: string,
	 * 	status: string,
	 * 	zipcode: boolean,
	 * 	externalData: {},
	 * 	externalReference: string,
	 * }} data
	 * @returns {Promise<Object>} delivery
	 */
	async saveDelivery(data = {}) {
		let isNew = !this._order.delivery
		let delivery = this._order.delivery || db.OrderDelivery.build({ orderId: this._order.id })

		let props = {
			methodKey: null,
			methodName: null,
			optionKey: null,
			optionName: null,
			data: null,
			cost: 0,
			discount: 0,
			discountName: null,
			status: null,
			zipcode: null,
			externalData: null,
			externalReference: null,
		}
		if (isNew) _.defaults(data, props)
		data = _.pickBy(data, (v, k) => k in props)
		delivery.set(data)
		delivery.set({ discount: Math.min(Math.abs(delivery.discount), delivery.cost) })
		delivery.set({ total: delivery.cost - delivery.discount })
		this._order.delivery = delivery

		let changed = delivery.changed()
		if (!changed) return delivery

		this._refreshTotal()
		if (this._simulation) return delivery

		return await db.$transaction(async (t) => {
			let subEvent = isNew ? 'CREATE' : 'UPDATE'
			await delivery.save()
			await this._order.save()
			await emitter.emit('OrderDelivery.SAVE', { orderMng: this, delivery, changed, subEvent, t })
			return delivery
		})
	}

	/**
	 * @param {{
	 * 	discountConfig: {},
	 * 	discountConfigId: number,
	 * 	triggerType: string,
	 * 	triggerKey: string,
	 * 	discountName: string,
	 * }} data
	 * @returns {Promise<Object>} delivery
	 */
	async saveDiscount(data = {}) {
		let isNew = !this._order.discount
		let discount = this._order.discount || db.OrderDiscount.build({ orderId: this._order.id })
		let { discountConfig } = data
		if (!data.discountConfigId) {
			data.discountConfigId = discountConfig?.id || null
		}

		let props = {
			discountConfigId: null,
			triggerType: null,
			triggerKey: null,
			discountName: null,
		}
		if (isNew) _.defaults(data, props)
		data = _.pickBy(data, (v, k) => k in props)

		discount.set(data)
		if (data.discountConfigId) {
			discount.discountConfig = discountConfig || (await db.DiscountConfig.findByPk(data.discountConfigId))
		}

		this._order.discount = discount
		if (this._simulation) return discount

		return await db.$transaction(async (t) => {
			let subEvent = isNew ? 'CREATE' : 'UPDATE'
			await discount.save()
			await this._order.save()
			await emitter.emit('OrderDiscount.SAVE', { orderMng: this, discount, subEvent, t })
			return discount
		})
	}

	/**
	 * @param {{
	 * 	firstname: string,
	 * 	lastname: string,
	 * 	email: string,
	 * 	phonePrefix: string,
	 * 	phoneNumber: string,
	 * }} data
	 * @returns {Promise<Object>} apiRes
	 */
	async saveBuyer(data = {}) {
		let apiRes = ApiRes()
		let isNew = !this._order.buyer
		let buyer = this._order.buyer || db.OrderBuyer.build({ orderId: this._order.id })

		let def = {
			firstname: undefined,
			lastname: undefined,
			email: undefined,
			phonePrefix: undefined,
			phoneNumber: undefined,
		}
		data = _.pickBy(_.defaults(data, def), (v, k) => k in def && (isNew || v !== undefined))
		let results = await buyer.setAndValidate(data)
		if (results !== true) {
			return apiRes.validation(results, 'buyer')
		}

		this._order.buyer = buyer
		if (!this._simulation) await buyer.save()
		return apiRes
	}

	/**
	 * @param {number} invoiceId
	 * @returns {Promise<Object>} apiRes
	 */
	async setInvoice(invoiceId) {
		let apiRes = ApiRes()
		if (!this._order.isCart || !this._order.userId) return apiRes.error(null)
		if (this._order.invoice && this._order.invoice.id == invoiceId) return apiRes
		let invoice = await db.Invoice.findByPk(invoiceId)
		if (!invoice || invoice.userId != this._order.userId) {
			// prettier-ignore
			return apiRes
				.error('Los datos de facturacion son inexistentes o no corresponden la usuario que generó la Orden de compra.')
				.validation('invoiceId', 'Inválido')
		}
		this._order.invoiceId = invoiceId
		this._order.invoice = invoice
		if (!this._simulation) await this._order.save()
		return apiRes
	}

	/**
	 * @param {Object} invoiceAddress
	 * @returns {Promise<boolean>} success
	 */
	async setInvoiceAddress(invoiceAddress) {
		let apiRes = ApiRes()
		if (!this._order.isCart) return apiRes.error(null)
		let result = await v.validate(invoiceAddress, v.required())
		if (result !== true) return apiRes.validation('invoiceAddress', result)
		this._order.invoiceAddress = invoiceAddress
		if (!this._simulation) await this._order.save()
		return apiRes
	}

	calculateTotalSize() {
		return this.items
			.filter((item) => item.type == 'physical')
			.reduce((sum, item) => {
				return sum + item.size * item.qty
			}, 0)
	}

	calculateTotalWeight() {
		return this.items
			.filter((item) => item.type == 'physical')
			.reduce((sum, item) => {
				return sum + item.weight * item.qty
			}, 0)
	}

	async _saveOrderItemsImages() {
		for (let item of this.items) {
			let filepath = path.join('public', item.image)
			let destImage = `/uploads/orders-images/${path.basename(item.image)}`
			let destFilepath = path.join('public', destImage)
			if (!fs.existsSync(destFilepath) && fs.existsSync(filepath)) {
				fs.copyFileSync(filepath, destFilepath)
			}
			await item.set({ image: destImage }).save()
		}
	}

	get titleStatus() {
		let { mainStatusFlow, paymentStatusFlow, makingStatusFlow, deliveryStatusFlow } = this
		let { paymentMethod, deliveryMethod } = this

		if (deliveryMethod) {
			if (!deliveryMethod.statusFlow.isInitial()) return deliveryMethod.statusFlow.current()
			if (!deliveryStatusFlow.isInitial()) return deliveryStatusFlow.current()
		}

		if (mainStatusFlow.is('confirmed')) {
			if (!makingStatusFlow.isInitial()) return makingStatusFlow.current()
		}

		if (mainStatusFlow.is('confirmed', 'canceled')) {
			if (!paymentMethod.statusFlow.isInitial()) return paymentMethod.statusFlow.current()
			if (!paymentStatusFlow.isInitial()) return paymentStatusFlow.current()
		}

		return mainStatusFlow.current()
	}

	includeStatusesInfo(fullInfo = false) {
		let info = {
			title: this.titleStatus,
			main: this.mainStatusFlow.current(),
			payment: this.paymentStatusFlow.current(),
			making: this.makingStatusFlow.current(),
			delivery: this.deliveryStatusFlow.current(),
			paymentMethod: this.paymentMethod.statusFlow.current(),
			deliveryMethod: this.deliveryMethod?.statusFlow.current(),
		}

		if (!fullInfo) {
			for (let key in info) {
				info[key] = _.pick(info[key], ['key', 'name', 'color'])
			}
		}

		this._order.statusesInfo = info
	}

	hasDigitalItems() {
		return !!this.items.find((item) => item.type == 'digital')
	}

	hasPhysicalItems() {
		return !!this.items.find((item) => item.type == 'physical')
	}

	async _saveOrderCode() {
		let config = await ConfigService.getActiveData('OrderCode')
		let { prefix, suffix, initialValue = 1, minLength = 4 } = config || {}
		let num = await KeyValueService.getForUpdate('order-code', (value) => {
			if (value < initialValue) return initialValue
			else return value + 1
		})
		let numStr = String(num).padStart(minLength, '0')
		let code = `${prefix || ''}${numStr}${suffix || ''}`
		await this._order.update({ code })
	}
}

KeyValueService.define('order-code', Number, { defaultValue: 0 })
module.exports = OrderManager
