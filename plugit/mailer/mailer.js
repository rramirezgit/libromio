const ejs = require('ejs')
const fs = require('fs')
const moment = require('moment')
const path = require('path')
const inlineCss = require('inline-css')
const Transport = require('./transport')

class Mailer {
	constructor(transportKey) {
		this._transportKey = transportKey
		this._to = []
		this._cc = []
		this._bcc = []
		this._subject = undefined
		this._text = undefined
		this._html = undefined
		this._render = { filename: null, data: {}, ejs: null, css: null }
		this._attachments = []
		this._enqueueOnFail = true
		this._forceEnqueue = false
		this._builder = null
	}

	static create(transportKey) {
		return new Mailer(transportKey)
	}

	static async buildAndSend(builderKey, data = {}, attempt = null) {
		let builder = MailerBuilder.get(builderKey, data)
		if (!builder) return null
		let mailer = new Mailer()
		mailer._builder = builder
		await builder.build(mailer)
		if (attempt) mailer.forceEnqueue(false)
		return await mailer.send(attempt)
	}

	transportKey(transportKey) {
		this._transportKey = transportKey
		return this
	}

	_addAddress(type, address) {
		if (!Array.isArray(address)) address = [address]
		for (let ad of address) {
			ad = ad.toLowerCase().trim()
			if (this[type].includes(ad)) continue
			if (type == '_to') {
				this._removeAddress('_cc', ad)._removeAddress('_bcc', ad)
			} else if (type == '_cc') {
				if (this._to.includes(ad)) continue
				this._removeAddress('_bcc', ad)
			} else {
				if (this._to.includes(ad) || this._cc.includes(ad)) continue
			}
			this[type].push(ad)
		}
		return this
	}

	_removeAddress(type, address) {
		let idx = this[type].indexOf(address)
		if (idx >= 0) this[type].splice(idx, 1)
		return this
	}

	to(address) {
		return this._addAddress('_to', address)
	}

	cc(address) {
		return this._addAddress('_cc', address)
	}

	bcc(address) {
		return this._addAddress('_bcc', address)
	}

	subject(text) {
		this._subject = text
		return this
	}

	text(text) {
		this._text = text
		return this
	}

	html(htmlStr) {
		this._html = htmlStr
		return this
	}

	renderFile(filename) {
		this._render.filename = filename
		return this
	}

	renderData(data) {
		Object.assign(this._render.data, data)
		return this
	}

	ejsOptions(options) {
		this._render.ejs = options
		return this
	}

	cssOptions(options) {
		this._render.css = options
		return this
	}

	render(filename, data = {}, options = {}) {
		this.renderFile(filename)
		this.renderData(data)
		if (options.ejs) this.ejsOptions(options.ejs)
		if (options.css) this.cssOptions(options.css)
		return this
	}

	async _renderHtml() {
		let { filename } = this._render
		// prettier-ignore
		filename = 'emails/' + filename.replace(/^\//, '').replace(/^emails\//, '').replace(/\.html$/, '') + '.html'
		let ejsRender = await new Promise((resolve) => {
			let { data, ejs: ejsOptions } = this._render
			let { APP_URL, NODE_ENV } = process.env
			Object.assign(data, { APP_URL, NODE_ENV, moment })
			ejs.renderFile(filename, data, ejsOptions, (error, html) => {
				if (error) resolve({ error: `EJS | Filename: ${filename} | ${error.message}` })
				else resolve({ html })
			})
		})

		if (ejsRender.error) return { error: ejsRender.error }

		let cssRender = await new Promise((resolve) => {
			let { css: cssOptions } = this._render
			let url = 'file://' + path.resolve('.', 'emails') + '/'
			inlineCss(ejsRender.html, {
				url,
				removeHtmlSelectors: true,
				applyWidthAttributes: true,
				preserveMediaQueries: true,
				applyTableAttributes: true,
				...(cssOptions || {}),
			})
				.then((html) => resolve({ html }))
				.catch((error) => resolve({ error: `INLINE CSS | Filename: ${filename} | ${error}` }))
		})

		if (cssRender.error) return { error: cssRender.error }
		return { html: cssRender.html }
	}

	/**
	 * @param {{ filename: string, path: string, content: string, contentType: string, cid: string }} attachment
	 */
	attach(attachments) {
		if (!Array.isArray(attachments)) attachments = [attachments]

		for (let attachment of attachments) {
			if (process.env.NODE_ENV == 'development' && attachment.path && !attachment.requiredForTest) {
				if (!fs.existsSync(attachment.path)) continue
			}
			this._attachments.push(attachment)
		}

		return this
	}

	enqueueOnFail(b = true) {
		this._enqueueOnFail = b
		return this
	}

	forceEnqueue(b = true) {
		this._forceEnqueue = b
		return this
	}

	_makeTransporterMessage() {
		if (!this._to || !this._subject) return null
		if (!this._html && !this._text) return null
		return {
			to: this._to,
			cc: this._cc,
			bcc: this._bcc,
			subject: this._subject,
			text: this._text,
			html: this._html,
			attachments: this._attachments,
		}
	}

	async send(attempt = null) {
		let builder = this._builder
		let transportKey = null
		let message = null

		let onError = async (error) => {
			let canEnqueue = this._enqueueOnFail || this._forceEnqueue
			if (builder) {
				error += ` | bulderKey ${builder.key}`
				if (canEnqueue)
					await MailerQueue.add(transportKey || 'none', message, { error, attempt, builder })
			} else {
				canEnqueue = canEnqueue && !!transportKey && !!message
				if (canEnqueue) await MailerQueue.add(transportKey, message, { error, attempt })
			}
			return { error, enqueued: canEnqueue }
		}

		transportKey = this._transportKey
		if (!transportKey) return await onError('No se ha definido el transportKey')

		if (this._render.filename) {
			let { html, error } = await this._renderHtml()
			if (error) return await onError(error)
			this.html(html)
		}

		message = this._makeTransporterMessage()
		if (!message) return await onError('Faltan parametros para el envío del email')

		if (this._forceEnqueue) {
			await MailerQueue.add(transportKey, message, { forced: true, builder })
			return { enqueued: true }
		}

		let transporter = await Transport.get(transportKey)
		if (!transporter) return await onError('No se pudo inicializar el transporter')

		let result = await new Promise((resolve) => {
			transporter.sendMail({ ...message }, (error, info) => {
				if (error) resolve({ error })
				else resolve({ info })
			})
		})

		let { error, info } = result
		if (error) return await onError(error.message)

		return { success: true, info }
	}
}

module.exports = Mailer
const MailerQueue = require('./mailer-queue')
const MailerBuilder = require('./mailer-builder')
