const winston = require('winston')
require('winston-daily-rotate-file')

const isDev = process.env.NODE_ENV == 'development'
const isProd = process.env.NODE_ENV == 'production'
const _loggers = {}

let errorTransports = []
errorTransports.push(
	new winston.transports.Console({
		level: 'error',
		handleExceptions: false,
		json: false,
		colorize: true,
		format: winston.format.combine(
			winston.format.colorize({ all: true }),
			winston.format.timestamp({ format: 'HH:mm:ss' }),
			winston.format.printf((info) => `[${info.timestamp}]\n${info.message}\n`)
		),
	})
)
if (isProd) {
	errorTransports.push(
		new winston.transports.File({
			level: 'error',
			filename: `__logs/error.log`,
			handleExceptions: false,
			json: false,
			maxsize: 21000000, //20M
			maxFiles: isProd ? 10 : 1,
			zippedArchive: isProd,
			colorize: true,
			format: winston.format.combine(
				winston.format.colorize({ all: true }),
				winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
				winston.format.printf((info) => `[${info.timestamp}]\n${info.message}\n`)
			),
		})
	)
}
_loggers.error = winston.createLogger({
	transports: errorTransports,
	exitOnError: false,
})

_loggers.debug = winston.createLogger({
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize({ all: true }),
				winston.format.timestamp({ format: 'HH:mm:ss' }),
				winston.format.printf((info) => `[${info.timestamp}] ${info.message}`)
			),
			level: 'debug',
			handleExceptions: false,
			json: false,
			colorize: true,
		}),
	],
})

_loggers.info = winston.createLogger({
	transports: [
		new winston.transports.DailyRotateFile({
			level: 'debug',
			filename: `__logs/info_%DATE%.log`,
			datePattern: 'YYYY-MM-DD',
			zippedArchive: isProd,
			maxFiles: isProd ? '30d' : '1d',
			json: false,
			format: winston.format.combine(
				winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
				winston.format.printf((info) => `[${info.timestamp}] ${info.message}`)
			),
		}),
	],
})

const _listeners = { debug: [], info: [], error: [] }
const _addListener = (event, fn) => {
	if (!_listeners[event] || typeof fn != 'function') return
	_listeners[event].push(fn)
}

const _makeMessage = (args) => {
	let message = []
	for (let arg of args) {
		if (!arg) continue
		if (Array.isArray(arg)) {
			message.push(arg.join(' | '))
		} else if (typeof arg == 'string') {
			message.push(arg.trim())
		} else if (typeof arg == 'object') {
			message.push(JSON.stringify(arg))
		}
	}
	return message.join('\n')
}
const _makeLog = (event, args) => {
	let message = _makeMessage(args)
	_loggers[event][event](message)
	for (let listener of _listeners[event]) {
		listener(message)
	}
}

const logger = Object.freeze({
	debug: (...args) => !isProd && _makeLog('debug', args),
	info: (...args) => _makeLog('info', args),
	error: (...args) => _makeLog('error', args),
	on: _addListener,
})

module.exports = logger
global.debug = logger.debug
