const AdminPagesService = require('./services/admin-pages-service')

AdminPagesService.addSection('settings', {
	path: '/settings',
	nav: { title: 'Administrar', position: 100 },
})

AdminPagesService.addPage('settings', 'configs', {
	path: '/configs',
	nav: { title: 'Configuraciones', icon: 'cog', position: 1 },
	viewComponent: 'AdminConfigs',
})
