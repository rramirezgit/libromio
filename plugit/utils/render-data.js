const fns = {}
const srvFns = {}

exports.add = (renderKey, fn) => {
	if (!fns[renderKey]) fns[renderKey] = []
	fns[renderKey].push(fn)
}

exports.addSrv = (renderKey, fn) => {
	if (!srvFns[renderKey]) srvFns[renderKey] = []
	srvFns[renderKey].push(fn)
}

async function assignData(fns, obj, req, res) {
	if (!fns) return
	let results = await Promise.all(fns.map(async (fn) => await fn(req, res)))
	for (let data of results) Object.assign(obj, data || {})
}

exports.get = async (renderKey, req, res) => {
	let data = { __SRV: {} }
	await Promise.all([
		assignData(fns[renderKey], data, req, res),
		assignData(srvFns[renderKey], data.__SRV, req, res),
	])
	return data
}
