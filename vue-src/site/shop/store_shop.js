// Pathify
import { make } from 'vuex-pathify'
import Srv from '@/__shared/utils/lib_srv'

// Data
const state = {
	user: Srv('user', null),
	wishlistIds: Srv('wishlistIds', null),
	loginDrawer: false,
	cartDrawer: false,
	menuMobileDrawer: false,
}

const mutations = {
	...make.mutations(state),
	SET_LOGIN_DRAWER: (state, value) => {
		state.loginDrawer = value
		state.cartDrawer = false
		state.menuMobileDrawer = false
		document.documentElement.classList.toggle('drawer-opened', value)
	},
	SET_CART_DRAWER: (state, value) => {
		state.cartDrawer = value
		state.loginDrawer = false
		state.menuMobileDrawer = false
		document.documentElement.classList.toggle('drawer-opened', value)
	},
	SET_MENU_MOBILE_DRAWER: (state, value) => {
		state.menuMobileDrawer = value
		state.loginDrawer = false
		state.cartDrawer = false
		document.documentElement.classList.toggle('drawer-opened', value)
	},
}

const actions = make.actions(state)

const getters = make.getters(state)

export default {
	name: 'shop',
	namespaced: true,
	state,
	mutations,
	actions,
	getters,
}
