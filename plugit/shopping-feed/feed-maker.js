const fs = require('fs')
const path = require('path')
const { ProductService } = require('#/shop-catalog')
const { Cron } = require('#/utils')
const googleFeed = require('./google-feed')
const facebookFeed = require('./facebook-feed')
const feedsDir = path.join('public', 'uploads', 'feeds')

async function run() {
	let feeds = [{ maker: googleFeed }, { maker: facebookFeed }]

	let page = 1
	let limit = 300

	feeds.map((feed) => {
		let line = feed.maker.makeHeaderLine && feed.maker.makeHeaderLine()
		feed.lines = line ? [line] : []
	})

	while (true) {
		let { products, pagination } = await ProductService.getAll({
			scope: 'productPage',
			page,
			limit,
			buyable: true,
		})

		await Promise.all(
			products.map(async (product) => {
				await Promise.all(
					feeds.map(async (feed) => {
						let line = await feed.maker.makeItemLine(product)
						line = line.replace(/(\n|\r)+/gm, ' ')
						feed.lines.push(line)
					})
				)
			})
		)

		if (pagination.lastPage > page) page++
		else break
	}

	if (!fs.existsSync(feedsDir)) fs.mkdirSync(feedsDir)
	for (let feed of feeds) {
		let file = path.join(feedsDir, feed.maker.filename)
		let content = feed.lines.join('\n')
		if (feed.maker.contentFilter) {
			content = feed.maker.contentFilter(content)
		}
		fs.writeFileSync(file, content)
	}
}

Cron.create('ShoppingFeed', {
	title: 'Google/Facebook shopping feed files',
	cronTime: '0 0 0 * * *',
	onTick: run,
	multipleRunning: false,
	runOnInit: !fs.existsSync(feedsDir),
})
