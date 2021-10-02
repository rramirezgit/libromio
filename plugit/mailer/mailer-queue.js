const moment = require('moment')
const { Op } = require('sequelize')
const Mailer = require('./mailer')
const MailerBuilder = require('./mailer-builder')
const { db } = require('#/express')
const { Cron } = require('#/utils')

const MailerQueue = {}
const _status = { consuming: false }

MailerQueue.add = async (transportKey, message, opts = {}) => {
	let { forced = false, error = null, attempt = 0, builder = null } = opts
	if (!forced && !attempt) attempt = 1
	let minutes = [0, 1, 3, 10, 20, 30, 60]
	let nextAttemptMinutes = attempt < minutes.length ? minutes[attempt] : 120
	let consumeAt = moment().add(nextAttemptMinutes, 'minutes')
	if (builder) {
		let serializedData = await builder.serialize()
		message = { builderKey: builder.key, serializedData }
	}
	await db.EmailQueue.create({
		transportKey,
		message,
		error,
		consumeAt,
		attempt,
	})
}

MailerQueue.consume = async () => {
	_status.consuming = true
	let email = await db.EmailQueue.findOne({
		where: {
			[Op.or]: {
				consumeAt: { [Op.lte]: moment().toDate() },
				attempt: 0,
			},
			attempt: { [Op.lte]: 10 },
		},
		order: ['attempt', 'consumeAt'],
		//logging: console.log,
	})

	if (!email) {
		_status.consuming = false
		return
	}

	let { message, attempt } = email
	attempt += 1
	if (message.builderKey) {
		let data = await MailerBuilder.unserializedData(message.builderKey, message.serializedData)
		await Mailer.buildAndSend(message.builderKey, data, attempt)
	} else {
		let mailer = Mailer.create(email.transportKey)
			.to(message.to)
			.cc(message.cc)
			.bcc(message.bcc)
			.subject(message.subject)
			.text(message.text)
			.html(message.html)
		message.attachments.forEach((attachment) => mailer.attach(attachment))
		await mailer.send(attempt)
	}

	await email.destroy()
	MailerQueue.consume()
}

_startConsuming = () => {
	if (_status.consuming) return
	MailerQueue.consume()
}

Cron.create('MailerQueue.consume', {
	title: 'MailerQueue',
	cronTime: '0 * * * * *',
	onTick: () => {
		_startConsuming()
	},
	multipleRunning: false,
	//runOnInit: true,
})

module.exports = MailerQueue
