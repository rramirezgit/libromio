import {
	CheckoutInit,
	DiscountStep,
	DeliveryStep,
	PaymentStep,
	SigninStep,
	ContactStep,
	ConfirmStep,
} from '@/site/autoloader'

export default [
	{
		path: '/checkout/init',
		name: 'checkout',
		component: CheckoutInit,
	},
	{
		path: '/checkout/:hash/discount',
		name: 'checkout.discount',
		component: DiscountStep,
	},
	{
		path: '/checkout/:hash/delivery',
		name: 'checkout.delivery',
		component: DeliveryStep,
	},
	{
		path: '/checkout/:hash/payment',
		name: 'checkout.payment',
		component: PaymentStep,
	},
	{
		path: '/checkout/:hash/signin',
		name: 'checkout.signin',
		component: SigninStep,
	},
	{
		path: '/checkout/:hash/contact',
		name: 'checkout.contact',
		component: ContactStep,
	},
	{
		path: '/checkout/:hash/confirm',
		name: 'checkout.confirm',
		component: ConfirmStep,
	},
]
