exports.__init = () => {
	exports.ShippingMethod = require('./shipping-method')
	require('./shop-api-router')
}
