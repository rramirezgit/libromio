const { CronJob, CronTime } = require('cron')
const all = {}
const Cron = {}
const globalCallbacks = []

Cron.create = (key, { title, cronTime, onTick, start, runOnInit, multipleRunning }) => {
	if (start === undefined) start = true
	if (multipleRunning === undefined) multipleRunning = true
	if (runOnInit === undefined) runOnInit = false
	let timezone = process.env.TZ || undefined
	let context = undefined

	let tickRunning = false
	let __onTick = async (cb) => {
		if (!multipleRunning && tickRunning) return
		tickRunning = true
		if (onTick) await onTick()
		if (cb) await cb()
		for (let cb of globalCallbacks) {
			await cb()
		}
		tickRunning = false
	}

	let job = new CronJob(cronTime, __onTick, null, start, timezone, context, runOnInit)
	all[key] = Object.freeze({
		title,
		onTick: __onTick,
		job,
		isTickRunning: () => tickRunning,
	})
	return job
}

Cron.stop = (key) => {
	let data = all[key]
	if (!data) return
	data.job.stop()
}

Cron.start = (key) => {
	let data = all[key]
	if (!data) return
	data.job.start()
}

Cron.setTime = (key, cronTime) => {
	let data = all[key]
	if (!data) return
	data.job.stop()
	data.job.setTime(new CronTime(cronTime))
	data.job.start()
}

Cron.run = async (key) => {
	let data = all[key]
	if (!data) return
	await data.onTick()
}

Cron.addCallback = (key, callback) => {
	let data = all[key]
	if (!data) return
	data.job.addCallback(callback)
}

Cron.getByKey = (key) => {
	return all[key]
}

Cron.getList = () => {
	return Object.entries(all).map(([key, { title }]) => ({ key, title }))
}

Cron.addGlobalCallback = (callback) => {
	globalCallbacks.push(callback)
}

module.exports = Object.freeze(Cron)
