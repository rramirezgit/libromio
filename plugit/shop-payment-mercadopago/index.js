exports.__init = () => {
	require('./admin-configs-definitions')
	require('./shop-api-router')
	exports.MPService = require('./mp-service')
	exports.MercadoPagoMethod = require('./mercado-pago-method')
}
