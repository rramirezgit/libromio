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
