const { PermissionsService } = require('#/admin')

PermissionsService.define('sales', {
	name: 'Ventas',
})
PermissionsService.define('sales_full', {
	name: 'Ventas Full',
	children: ['sales'],
})
PermissionsService.define('full', { addChildren: ['sales_full'] })
