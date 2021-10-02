const moment = require('moment')

const format = {
	price: (amount, opts = {}) => {
		let { decimalCount = 2, decimal = ',', thousands = '.', currency = '$', currencyAfter = false } = opts
		decimalCount = Math.abs(decimalCount)
		decimalCount = isNaN(decimalCount) ? 2 : decimalCount

		let negativeSign = amount < 0 ? '-' : ''
		let i = parseInt((amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))).toString()
		let j = i.length > 3 ? i.length % 3 : 0

		let strBefore = negativeSign + (currencyAfter ? '' : currency)
		// prettier-ignore
		let strNum = (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands)
		// prettier-ignore
		let strDec = decimalCount ? (decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2)) : ''
		let strAfter = currencyAfter ? currency : ''
		let str = `${strBefore} ${strNum}${strDec} ${strAfter}`
		return str.trim()
	},
	date: (date) => moment(date).format('DD/MM/YYYY'),
	time: (date) => moment(date).format('HH:mm [hs.]'),
	datetime: (date) => moment(date).format('DD/MM/YYYY HH:mm [hs.]'),
}

module.exports = format
