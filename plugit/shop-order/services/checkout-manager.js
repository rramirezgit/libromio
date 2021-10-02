const { pascalCase } = require('case-anything')
const _ = require('lodash')
const objectHash = require('object-hash')
const moment = require('moment')
const OrderManager = require('./order-manager')
const CartManager = require('./cart-manager')
const DeliveryService = require('./delivery-service')
const PaymentService = require('./payment-service')
const InvoiceService = require('./invoice-service')
const { ApiRes, v } = require('#/utils')
const { db } = require('#/express')

const _steps = ['discount', 'delivery', 'payment', 'signin', 'contact', 'confirm']

class CheckoutManager {
	static async create(req, res, hash = null) {
		if (hash) {
			let data = req.session.get(`checkout-${hash}`)
			if (!data) return null
			let orderMng = await OrderManager.fromId(data.orderId)
			if (!orderMng || !orderMng.order.isCart) return null
			return new CheckoutManager(orderMng, data, req, res)
		} else {
			let cartMng = await CartManager.fromCookie(req, res)
			if (!cartMng) return null
			return new CheckoutManager(cartMng.orderMng, null, req, res)
		}
	}

	static get steps() {
		return [..._steps]
	}

	constructor(orderMng, data, req, res) {
		this._orderMng = orderMng
		this._orderMng.simulationMode(true)
		this._data = data || {}
		this._user = req.user
		this._req = req
		this._res = res
		this._loadData()
	}

	get orderMng() {
		return this._orderMng
	}

	get hash() {
		return this._data.hash
	}

	get _sessionKey() {
		return `checkout-${this._data.hash}`
	}

	_loadData() {
		let data = this._data
		let { order } = this._orderMng
		data.orderId = order.id
		data.hash = data.hash || objectHash({ id: order.id, date: Date.now() })
		data.steps = data.steps || {}
		if (!data.itemsData) {
			data.itemsData = this._orderMng.itemsData
		} else {
			this._orderMng.setItems(data.itemsData)
		}
		this._saveSession()
	}

	_saveSession() {
		this._req.session.set(this._sessionKey, this._data)
	}

	_destroySession() {
		this._req.session.delete(this._sessionKey)
	}

	async refresh(opts = {}) {
		let apiRes = ApiRes()

		if (this._user) await this._orderMng.setUser(this._user.id)

		await this._orderMng.refresh({ validateQty: false })
		if (this._orderMng.empty) {
			this._destroySession()
			return apiRes
				.error(
					'La orden de compra fue cancelada. Los productos agregados al carrito ya no se encuentran disponibles'
				)
				.data({ checkout: { empty: true } })
		}

		if (this._orderMng.autoModified) {
			return apiRes
				.error({
					title: 'La orden de compra ha sido modificada',
					text: 'Algunos de los productos ya no se encuentra disponible o se ha modificado su cantidad debido al stock actual.',
				})
				.data({ checkout: { autoModified: true, order: this._orderMng.order } })
		}

		let { currentStep } = opts
		if (currentStep) {
			for (let stepKey of _steps) {
				if (currentStep == stepKey) break
				let payload = this._data.steps[stepKey]
				if (!payload) {
					if (currentStep) return apiRes.error(null).data({ checkout: { missingStep: stepKey } })
					else break
				}
				let stepApiRes = await this.setStepData(stepKey, payload)
				if (stepApiRes.hasErrors()) {
					return apiRes.merge(stepApiRes).data({ checkout: { missingStep: stepKey } })
				}
			}
		}

		await this._orderMng.refresh({ validateQty: false })

		this._data.itemsData = this._orderMng.itemsData
		this._saveSession()
		let checkout = {
			order: this._orderMng.order,
			hash: this._data.hash,
			steps: this._data.steps,
		}
		return apiRes.data({ checkout })
	}

	async getStepData(stepKey) {
		let apiRes = await this[`_getStepData_${pascalCase(stepKey)}`]()
		if (apiRes === false) {
			this._data.steps[stepKey] = { _jump: true }
			let nextStep = _steps[_steps.indexOf(stepKey) + 1]
			return ApiRes().data({ nextStep })
		}
		return apiRes
	}

	async setStepData(stepKey, payload) {
		payload = payload || {}
		let apiRes = await this[`_setStepData_${pascalCase(stepKey)}`](payload)
		if (apiRes.isSuccess()) {
			this._data.steps[stepKey] = payload
			this._saveSession()
			let nextStep = _steps[_steps.indexOf(stepKey) + 1]
			apiRes.data({ nextStep })
		}
		return apiRes
	}

	// DISCOUNT -----------------------------------------------------------------
	async _getStepData_Discount() {
		let discountCouponsOptions = []
		return ApiRes().data({ discountCouponsOptions })
	}

	async _setStepData_Discount(payload) {
		let apiRes = ApiRes()
		let { noCode, couponCode } = payload
		if (noCode) return apiRes

		let results = await v.validate(couponCode, v.required())
		if (results !== true) return apiRes.validation('couponCode', results)

		let discountCoupon = await db.DiscountCoupon.findOne(
			db.$queryBuilder().join('discountConfig', { required: true }).where({ code: couponCode }).get()
		)

		// prettier-ignore
		let error = () => apiRes.validation('couponCode', 'El cupón es inválido, ya se ha consumido o no se encuentra vigente al día de hoy.')

		if (!discountCoupon) return error()
		if (discountCoupon.consumable && discountCoupon.qty - discountCoupon.consumedQty <= 0) return error()
		if (discountCoupon.dueDate && moment().isAfter(discountCoupon.dueDate, 'day')) return error()

		await this._orderMng.saveDiscount({
			discountConfig: discountCoupon.discountConfig,
			triggerType: 'coupon',
			triggerKey: discountCoupon.code,
			discountName: `CUPON ${discountCoupon.code}`,
		})
		return apiRes
	}

	// DELIVERY -----------------------------------------------------------------
	async _getStepData_Delivery() {
		if (!this._orderMng.items.find(({ type }) => type == 'physical')) return false
		let deliveryMethods = await DeliveryService.getSelectableMethods(this._orderMng)
		return ApiRes().data({ deliveryMethods })
	}

	async _setStepData_Delivery(payload) {
		if (!this._orderMng.items.find(({ type }) => type == 'physical')) {
			return ApiRes().data({ jumpStep: true })
		}

		let { methodKey, input } = payload
		let method = DeliveryService.getMethod(methodKey, this._orderMng)
		if (!method || !(await method.isEnabled())) {
			return ApiRes().error('El método de envío es inexistente o ha sido deshabilitado')
		}
		let deliveryData = await method.getOrderDeliveryData(input)
		if (!deliveryData) return ApiRes().error('Ha ocurrido un error inesperado')
		await this._orderMng.saveDelivery(deliveryData)
		return ApiRes()
	}

	// PAYMENT -----------------------------------------------------------------
	async _getStepData_Payment() {
		let paymentMethods = await PaymentService.getSelectableMethods(this._orderMng)
		return ApiRes().data({ paymentMethods })
	}

	async _setStepData_Payment(payload) {
		let { methodKey, input } = payload
		let method = PaymentService.getMethod(methodKey, this._orderMng)
		if (!method || !(await method.isEnabled())) {
			return ApiRes().error('El método de envío es inexistente o ha sido deshabilitado')
		}
		let paymentData = await method.getOrderPaymentData(input)
		if (!paymentData) return ApiRes().error('Ha ocurrido un error inesperado')
		await this._orderMng.savePayment(paymentData)
		return ApiRes()
	}

	// SIGNIN -----------------------------------------------------------------
	async _getStepData_Signin() {
		if (this._user) return false
		return ApiRes()
	}

	async _setStepData_Signin(payload) {
		if (!this._user) return ApiRes().error(null)
		return ApiRes().data({ jumpStep: true })
	}

	// CONTACT - INVOICE -----------------------------------------------------------------
	async _getStepData_Contact() {
		let invoices = await InvoiceService.getAll(this._user.id)
		return ApiRes().data({ invoices })
	}

	async _setStepData_Contact(payload) {
		let apiRes = ApiRes()
		if (!this._user) return apiRes.error(null)

		await db.$transaction(async (t) => {
			let { buyer, invoiceId, invoice, invoiceAddress } = payload
			apiRes.merge(await this._orderMng.saveBuyer(buyer))
			apiRes.merge(await this._orderMng.setUser(this._user.id))
			if (invoiceId) {
				apiRes.merge(await this._orderMng.setInvoice(invoiceId))
			} else {
				let invoiceApiRes = await InvoiceService.create({ ...invoice, userId: this._user.id })
				let { success, data } = invoiceApiRes.get()
				if (success) {
					payload.invoiceId = data.invoice.id
					apiRes.merge(await this._orderMng.setInvoice(data.invoice.id))
				} else {
					apiRes.merge(invoiceApiRes)
				}
			}
			apiRes.merge(await this._orderMng.setInvoiceAddress(invoiceAddress))

			if (apiRes.isSuccess()) {
				delete payload.invoice
				let { email: contactEmail, firstname, lastname, phonePrefix, phoneNumber } = buyer
				await this._user.set({ contactEmail, firstname, lastname, phonePrefix, phoneNumber }).save()
			} else {
				throw null
			}
		})

		return apiRes
	}

	// CONFIRM -----------------------------------------------------------------
	async _getStepData_Confirm() {
		let steps = [..._steps]
		steps.splice(steps.indexOf('signin'), 1)
		steps.splice(steps.indexOf('confirm'), 1)
		return ApiRes().data({ confirmSteps: steps })
	}

	async _setStepData_Confirm(payload) {
		this._orderMng.simulationMode(false)
		let apiRes = await this.refresh({ currentStep: 'confirm' })
		if (apiRes.hasErrors()) return apiRes

		return await db.$transaction(async () => {
			await this._orderMng.confirmOrder()
			let { methodKey } = this._orderMng.order.payments[0]
			let method = PaymentService.getMethod(methodKey, this._orderMng)
			return await method.resolveOrderConfirmationResponse()
		})
	}
}

module.exports = CheckoutManager
