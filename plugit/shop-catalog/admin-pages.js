const { AdminPagesService } = require('#/admin')

AdminPagesService.addSection('catalog', {
	path: '/catalog',
	nav: { title: 'Catálogo', position: 2 },
})

AdminPagesService.addPage('catalog', 'products', {
	path: '/products',
	nav: { title: 'Productos', icon: 'cart-outline', position: 1 },
	viewComponent: 'CatalogProducts',
	permission: 'catalog',
})

AdminPagesService.addPage('catalog', 'products.single', {
	path: '/products/:id',
	nav: false,
	viewComponent: 'CatalogProductsSingle',
	permission: 'catalog',
})

AdminPagesService.addPage('catalog', 'categories', {
	path: '/categories',
	nav: { title: 'Categorías', icon: 'file-tree', position: 2 },
	viewComponent: 'CatalogCategories',
	permission: 'catalog',
})

AdminPagesService.addPage('catalog', 'brands', {
	path: '/brands',
	nav: {
		title: 'Marcas',
		icon: 'copyright',
		position: 3,
	},
	viewComponent: 'CatalogBrands',
	permission: 'catalog',
})

AdminPagesService.addPage('catalog', 'collections', {
	path: '/collections',
	nav: {
		title: 'Colecciones',
		icon: 'group',
		position: 4,
	},
	viewComponent: 'CatalogCollections',
	permission: 'catalog',
})

AdminPagesService.addPage('catalog', 'price-config', {
	path: '/price-config',
	nav: {
		title: 'Configurador de Precios',
		icon: 'currency-usd',
		position: 5,
	},
	viewComponent: 'CatalogPriceConfig',
	permission: 'catalog',
})
