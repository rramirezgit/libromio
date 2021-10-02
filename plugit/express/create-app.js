const express = require('express')
const cors = require('cors')
const ejs = require('ejs')
const acceptWebp = require('accept-webp')
const cookieParser = require('cookie-parser')
const postParser = require('./post-parser')
const PreRender = require('prerender-node')
const { ApiRes, accessLogger, session } = require('#/utils')

module.exports = (opt = {}) => {
	const app = express()

	if (process.env.NODE_ENV != 'development') {
		app.set('trust proxy', true)
	}

	app.start = () => {
		let port = process.env.PORT || '3000'
		app.listen(port, () => debug(`App running in port ${port}`))
	}

	// Public path
	const maxAge = process.env.NODE_ENV == 'production' ? 5184000000 * 3 : 0
	const etag = process.env.NODE_ENV == 'production'
	app.use(
		'/__static',
		express.static('vue-dist/__static', { maxAge, etag, fallthrough: false }),
		(err, req, res, next) => res.sendStatus(404)
	)
	app.use(
		'/uploads',
		acceptWebp('public/uploads', ['jpg', 'jpeg', 'png']),
		express.static('public/uploads', { maxAge, etag, fallthrough: false }),
		(err, req, res, next) => res.sendStatus(404)
	)

	if (process.env.NODE_ENV == 'production') {
		let [protocol, host] = process.env.APP_URL.split('://')
		app.use(
			PreRender.set('prerenderToken', 'ZCMtIqmjPOBTNr7ByZWb').set('protocol', protocol).set('host', host)
		)
	}

	// Views engine
	app.set('views', 'vue-dist/__views')
	app.set('view engine', 'html')
	app.engine('html', async (filename, data, cb) => {
		let options = {
			openDelimiter: '{',
			closeDelimiter: '}',
			delimiter: '',
		}
		return ejs.renderFile(filename, data, options, cb)
	})

	// Access Logger
	if (process.env.NODE_ENV != 'development') {
		app.use(accessLogger())
	}

	// Cookies
	app.use(cookieParser())

	// Session
	app.use(
		session({
			path: './storage/sessions',
			ttl: 48 * 3600,
			secret: 'drubbishop_qwje93EF1567',
		})
	)

	// Post
	app.use(cors())
	app.use(postParser())
	app.use(ApiRes.mid())
	return app
}
