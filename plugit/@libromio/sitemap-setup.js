const { SitemapMaker } = require('#/utils')
SitemapMaker.builder('site-pages', {
	urls: [
		'/',
		'/somos',
		'/comprar',
		'/privacidad',
		'/terminos-y-condiciones',
		'/envios-y-devoluciones',
		'/pagos',
	],
})
if (process.env.NODE_ENV == 'production') {
	SitemapMaker.start()
}
