exports.__init = () => {
	const AddressService = require('./services/address-service')
	exports.AddressService = AddressService

	const OrderService = require('./services/order-service')
	exports.OrderService = OrderService

	const OrderManager = require('./services/order-manager')
	exports.OrderManager = OrderManager

	const CartManager = require('./services/cart-manager')
	exports.CartManager = CartManager

	const CheckoutManager = require('./services/checkout-manager')
	exports.CheckoutManager = CheckoutManager

	const OrderItemAdaptor = require('./services/order-item-adaptor')
	exports.OrderItemAdaptor = OrderItemAdaptor

	// DELIVERY
	const DeliveryService = require('./services/delivery-service')
	exports.DeliveryService = DeliveryService

	const DeliveryMethod = require('./services/delivery-method')
	exports.DeliveryMethod = DeliveryMethod

	const DeliveryMethodStatusFlow = require('./statuses/delivery-method-status-flow')
	exports.DeliveryMethodStatusFlow = DeliveryMethodStatusFlow

	// PAYMENT
	const PaymentService = require('./services/payment-service')
	exports.PaymentService = PaymentService

	const PaymentMethod = require('./services/payment-method')
	exports.PaymentMethod = PaymentMethod

	const PaymentMethodStatusFlow = require('./statuses/payment-method-status-flow')
	exports.PaymentMethodStatusFlow = PaymentMethodStatusFlow

	require('./shop-api-router')
	require('./shop-router')
	require('./admin-permissions')
	require('./admin-pages')
	require('./admin-api-router')
	require('./admin-configs-definitions')
	require('./db-zipcodes/ar')
	require('./mailer-setup')
	require('./cron-setup')
	require('./render-data-setup')
}
