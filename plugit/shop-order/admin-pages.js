const { AdminPagesService } = require('#/admin')

AdminPagesService.addSection('sales', {
	path: '/sales',
	nav: { title: 'Ventas', position: 3 },
})

AdminPagesService.addPage('sales', 'orders', {
	path: '/orders',
	nav: { title: 'Órdenes de compra', icon: 'shopping', position: 1 },
	viewComponent: 'SalesOrders',
	permission: 'sales',
})

AdminPagesService.addPage('sales', 'orders.single', {
	path: '/orders/:id',
	nav: false,
	viewComponent: 'SalesOrdersSingle',
	permission: 'sales',
})
