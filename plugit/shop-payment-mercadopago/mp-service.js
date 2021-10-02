const axios = require('axios')
const mercadopago = require('mercadopago')
const { ConfigService } = require('#/admin')
const { apiBaseUrl } = require('#/shop')

const callbackEndpoints = {
	success: '/mp/back-url/success',
	failure: '/mp/back-url/failure',
	pending: '/mp/back-url/pending',
}

let initialized = false
const initialize = async () => {
	if (!initialized) {
		let mpConfig = await ConfigService.getActiveData('MercadoPago')
		if (mpConfig) {
			let { accessToken } = mpConfig
			mercadopago.configure({ access_token: accessToken })
			initialized = true
		}
	}
	return initialized
}

async function createPreference(orderMng, payment) {
	if (!(await initialize())) return false

	let { order } = orderMng
	let { body } = await mercadopago.preferences.create({
		items: [
			{
				title: `Pedido #${order.code}`,
				unit_price: payment.amount,
				quantity: 1,
			},
		],
		back_urls: {
			success: process.env.APP_URL + apiBaseUrl + callbackEndpoints.success,
			failure: process.env.APP_URL + apiBaseUrl + callbackEndpoints.failure,
			pending: process.env.APP_URL + apiBaseUrl + callbackEndpoints.pending,
		},
		auto_return: 'approved',
		external_reference: 'DBS-' + payment.id,
	})
	let { sandbox } = await ConfigService.getActiveData('MercadoPago')

	return {
		mpId: body.id,
		initPoint: sandbox ? body.sandbox_init_point : body.init_point,
	}
}

async function getPaymentInfo(mpPaymentId) {
	if (!(await initialize())) return false
	let { body } = await mercadopago.payment.get(mpPaymentId)
	return body
}

module.exports = { createPreference, getPaymentInfo, callbackEndpoints }
