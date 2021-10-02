const _try = (func, onCatch) => async (req, res, next) => {
	try {
		await func(req, res, next)
	} catch (err) {
		onCatch && onCatch(err)
		next(err)
	}
}

module.exports = _try
