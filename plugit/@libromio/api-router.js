const Newsletter = require('./services/newsletter-service')
const { _try } = require('#/utils')
const { apiRouter } = require('#/shop')

// // Require Passport Config
// require('./config-passport')(passport)
// // Passport Middlewares
// router.use(passport.initialize())
apiRouter.post(
	'/tienda/savenewsletteremail',
	_try(async (req, res, next) => {
		let data = req.body.email
		let apiRes = await Newsletter.saveNewsLetterEmail(data)
		res.api.set(apiRes).json()
	})
)
