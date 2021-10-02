import Vue from 'vue'
import moment from 'moment'

Vue.filter('date', (value) => {
	if (value) return moment(String(value)).format('DD/MM/YYYY')
	else return ''
})

Vue.filter('time', (value) => {
	if (value) return moment(String(value)).format('HH:mm [hs]')
	else return ''
})

Vue.filter('datetime', (value) => {
	if (value) return moment(String(value)).format('DD/MM/YYYY HH:mm [hs]')
	else return ''
})

function formatPrice(amount, opts = {}) {
	let { decimalCount = 2, decimal = ',', thousands = '.', currency = '$' } = opts
	decimalCount = Math.abs(decimalCount)
	decimalCount = isNaN(decimalCount) ? 2 : decimalCount

	let negativeSign = amount < 0 ? '-' : ''
	let i = parseInt((amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))).toString()
	let j = i.length > 3 ? i.length % 3 : 0

	// prettier-ignore
	return (
		negativeSign + currency + ' ' + (j ? i.substr(0, j) + thousands : '') +
		i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousands) +
		(decimalCount ? (decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2)) : '')
	)
}

Vue.filter('price', (value) => formatPrice(value || 0))
