const { Router } = require('express')
const { _try, logger, RenderData } = require('#/utils')
const { router: adminRouter } = require('#/admin')

const router = Router()

router.use(adminRouter)

router.get(
	'*',
	_try(async (req, res, next) => {
		if (req.xhr) return next()
		debug(req.originalUrl)
		let data = await RenderData.get('site', req, res)
		res.render('site', data)
	})
)

router.use((err, req, res, next) => {
	logger.error(`URL: ${req.originalUrl}`, err.stack)
	//res.send(err.message)
})

module.exports = router
