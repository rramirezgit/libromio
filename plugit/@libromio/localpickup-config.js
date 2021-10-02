const { LocalPickupMethod } = require('#/shop-delivery-localpickup')
LocalPickupMethod.registerOption((orderMng) => ({
	key: 'sucursal-central',
	name: 'Sucursal Central',
	enabled: true,
	title: 'Retiro por Sucursal',
	availability: 'Retiro inmediato',
	addressLine: 'Holmberg 4156 PB, Saavedra, CABA',
	businessHours: 'Lunes a Viernes de 10 a 17 hs.',
	phone: '', //(011) 3111-1679',
	extras: [
		// prettier-ignore
		//{icon: 'credit-card', text: 'Para retirar el o los productos deberá presentarse el titular de la tarjeta, con el DNI y la tarjeta de Crédito o Débito que utilizó para hacer la compra, en caso de haber utilizado dicho método de pago, sin excepción.'},
	],
	zipcode: '1414',
}))
