const Cron = require('./cron')
const fs = require('fs')
const moment = require('moment')

const SitemapMaker = {}
const _builders = {}
let _started = false

SitemapMaker.builder = (key, opts = {}) => {
	let { urls, priority } = opts
	_builders[key] = { urls, priority }
}

async function makeXml() {
	let xml = '<?xml version="1.0" encoding="utf-8"?>'
	xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

	let lastmod = moment().format('YYYY-MM-DD')
	let changefreq = 'daily'
	let defaultPriority = 0.9
	for (let [key, builder] of Object.entries(_builders)) {
		let priority = builder.priority || defaultPriority
		let urls = []
		if (typeof builder.urls == 'function') {
			urls = await builder.urls()
		} else {
			urls = builder.urls
		}
		for (let url of urls) {
			xml += createEntryXml(url, lastmod, changefreq, priority)
		}
	}

	xml += '</urlset>'
	fs.writeFileSync('public/uploads/sitemaps/sitemap.xml', xml)
}

function createEntryXml(url, lastmod, changefreq, priority) {
	return (
		'<url>' +
		`<loc>${process.env.APP_URL + url}</loc>` +
		`<lastmod>${lastmod}</lastmod>` +
		`<changefreq>${changefreq}</changefreq>` +
		`<priority>${priority.toFixed(1)}</priority>` +
		'</url>'
	)
}

SitemapMaker.start = () => {
	if (_started) return
	_started = true
	Cron.create('SitemapMaker', {
		title: 'Sitemap Maker',
		cronTime: '0 0 1 * * *',
		runOnInit: true,
		multipleRunning: false,
		onTick: async () => {
			await makeXml()
		},
	})
}

module.exports = SitemapMaker
