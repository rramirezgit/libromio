const { AdminPagesService } = require('#/admin')

AdminPagesService.addPage('settings', 'users', {
	path: '/users',
	nav: { title: 'Usuarios', icon: 'account-multiple', position: 2 },
	viewComponent: 'RegisteredUsers',
	permission: 'full',
})
