const { Router } = require('express')
const { adminBaseUrl } = require('./index')
const { validateToken } = require('./auth-mids')
const loginRouter = require('./login-router')
const apiRouter = require('./api-router')
const ConfigService = require('./services/config-service')
const { _try, logger } = require('#/utils')

const router = Router()
const mainRouter = Router()
mainRouter.use(adminBaseUrl, router)

router.use('/', loginRouter)
router.use('/', validateToken())
router.use('/api', apiRouter)

router.get(
	'*',
	_try(async (req, res, next) => {
		let AdminTheme = await ConfigService.getActiveData('AdminTheme')
		res.render('admin', { AdminTheme })
	})
)

router.use(async (err, req, res, next) => {
	logger.error(err.stack)
	let title = 'Ha ocurrido un error inesperado'
	let text =
		'Te pedimos disculpas por las molestias ocasionadas. En breve estaremos resolviendo el inconveniente.'
	let description = err.stack
	res.status(500)
	if (req.xhr) {
		res.api.error({ title, text, description, code: 500 }).json()
	} else {
		res.send(description)
	}
})

module.exports = mainRouter
