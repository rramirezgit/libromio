const fs = require('fs')
const path = require('path')
const moment = require('moment')
const signature = require('cookie-signature')
const uid = require('uid-safe').sync
const Cron = require('./cron')
const createDir = require('./create-dir')

function SessionData(data) {
	const initial = JSON.stringify(data)
	this.get = (k) => {
		return data[k]
	}
	this.set = (k, v) => {
		if (typeof k == 'object') {
			Object.assign(data, k)
		} else if (v !== undefined) {
			data[k] = v
		}
		return this
	}
	this.delete = (k) => {
		delete data[k]
		return this
	}
	this.wasModified = () => JSON.stringify(data) != initial
	this.isEmpty = () => Object.keys(data).length == 0
}

function _isEqual(v1, v2) {
	return JSON.stringify(v1) == JSON.stringify(v2)
}

function session(opts = {}) {
	opts = {
		path: './sessions',
		cookieName: '__sessionid',
		secret: 'mysecret',
		ttl: 3600,
		...opts,
	}

	function _generateSid() {
		return uid(24)
	}

	function _saveCookie(res, cookie) {
		res.cookie(opts.cookieName, cookie, { maxAge: opts.ttl * 1000 })
	}

	function _deleteCookie(res) {
		res.clearCookie(opts.cookieName)
	}

	function _getCookie(req) {
		return req.cookies[opts.cookieName]
	}

	function _signSid(sid) {
		return signature.sign(sid, opts.secret)
	}

	function _unsignSid(cookie) {
		return signature.unsign(cookie, opts.secret) || null
	}

	function _getFilepath(sid) {
		return path.join(opts.path, `${sid}.json`)
	}

	function _saveSessionData(sid, data) {
		fs.writeFileSync(_getFilepath(sid), JSON.stringify(data))
	}

	function _deleteSessionData(sid) {
		let file = _getFilepath(sid)
		fs.existsSync(file) && fs.unlinkSync(file)
	}

	function _getSessionData(sid) {
		try {
			return JSON.parse(fs.readFileSync(_getFilepath(sid))) || {}
		} catch (err) {
			return {}
		}
	}

	function _beforeEnd(res, beforeEndFn) {
		let end = res.end
		res.end = (...args) => {
			beforeEndFn()
			end.apply(res, args)
		}
	}

	// create dir if not exists
	createDir(opts.path)

	Cron.create('Session.cleanExpired', {
		title: 'Borrar sesiones vencidas',
		cronTime: '0 0 6 * * *',
		onTick: () => {
			let now = moment()
			let files = fs.readdirSync(opts.path)
			for (let file of files) {
				if (file == '.empty') continue
				let filepath = path.join(opts.path, file)
				fs.stat(filepath, (err, stats) => {
					if (err) return
					let diff = now.diff(stats.mtime, 'seconds')
					if (diff > opts.ttl) fs.unlinkSync(filepath)
				})
			}
		},
	})

	return (req, res, next) => {
		let cookie = _getCookie(req)

		let sid = cookie ? _unsignSid(cookie) : null
		req.sessionId = sid

		let data = sid ? _getSessionData(sid) : {}
		req.session = new SessionData(data)

		_beforeEnd(res, () => {
			if (req.session.isEmpty()) {
				cookie && _deleteCookie(res)
				sid && _deleteSessionData(sid)
				return
			}

			if (req.session.wasModified()) {
				sid = sid || _generateSid()
				cookie = cookie || _signSid(sid)
				_saveSessionData(sid, data)
			}

			if (sid) _saveCookie(res, cookie)
		})

		next()
	}
}

module.exports = session
