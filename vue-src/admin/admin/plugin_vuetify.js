// Vuetify Documentation https://vuetifyjs.com

import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import es from 'vuetify/lib/locale/es'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

const theme = {
	primary: '#01579b',
	secondary: '#9C27b0',
	accent: '#e91e63',
	info: '#00CAE3',
	success: '#4CAF50',
	warning: '#FB8C00',
	error: '#FF5252',
	link: colors.blue.darken4,
}

const vuetify = new Vuetify({
	breakpoint: { mobileBreakpoint: 960 },
	icons: {
		iconfont: 'mdi',
		values: { expand: 'mdi-menu-down' },
	},
	theme: {
		options: {
			customProperties: true,
		},
		themes: {
			dark: theme,
			light: theme,
		},
	},
	lang: {
		locales: { es },
		current: 'es',
	},
})

export default { vuetify }
