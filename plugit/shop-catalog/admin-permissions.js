const { PermissionsService } = require('#/admin')

PermissionsService.define('catalog', {
	name: 'Catálogo',
})
PermissionsService.define('catalog_full', {
	name: 'Catálogo Full',
	children: ['catalog'],
})
PermissionsService.define('full', { addChildren: ['catalog_full'] })
