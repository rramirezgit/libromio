const morgan = require('morgan')
const winston = require('winston')
require('winston-daily-rotate-file')
const isProd = process.env.NODE_ENV == 'production'

let logger = winston.createLogger({
	transports: [
		new winston.transports.DailyRotateFile({
			level: 'info',
			filename: '__logs/access_%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			zippedArchive: isProd,
			//maxSize: '20m',
			maxFiles: isProd ? '60d' : '1d',
			json: false,
			format: winston.format.combine(winston.format.printf((info) => info.message)),
		}),
	],
})

const options = {
	stream: {
		write: (message, encoding) => {
			logger.info(message.trim().replace(/\n/, ''))
		},
	},
}

module.exports = () => morgan('common', options)
