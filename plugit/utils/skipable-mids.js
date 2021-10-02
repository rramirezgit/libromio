/* Usage 
	app.use(skipableMids(
		async (req, res, next, skip) => {
			if(...) {
				// this will not execute the next mids passed to skipableMids
				return skip()
			}
			...
			next()
		},
		async (req, res, next, skip) => {
			...
			next()
		}
	))
*/

module.exports = (...fns) => async (req, res, next) => {
	for (let fn of fns) {
		let result = await new Promise(async (resolve) => {
			let _next = (err) => resolve({ next: true, err })
			let _skip = () => resolve({ skip: true })
			try {
				await fn(req, res, _next, _skip)
			} catch (err) {
				_next(err)
			}
		})

		if (result.skip) return next()
		if (result.next && result.err) return next(result.err)
	}
	next()
}
