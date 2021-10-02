import { TermsCondition, Privacy, DeliveryInfo, PaymentInfo, Us, HowTo } from '@/site/autoloader'

export default [
	{
		path: '/terminos-y-condiciones',
		name: 'terms',
		component: TermsCondition,
	},
	{
		path: '/privacidad',
		name: 'privacy',
		component: Privacy,
	},
	{
		path: '/envios-y-devoluciones',
		name: 'deliveryInfo',
		component: DeliveryInfo,
	},
	{
		path: '/pagos',
		name: 'paymentsInfo',
		component: PaymentInfo,
	},
	{
		path: '/somos',
		name: 'us',
		component: Us,
	},
	{
		path: '/comprar',
		name: 'howto',
		component: HowTo,
	},
]
