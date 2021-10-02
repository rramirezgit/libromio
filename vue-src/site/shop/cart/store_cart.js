// Pathify
import { make } from 'vuex-pathify'
import Srv from '@/__shared/utils/lib_srv'

// Data
const state = {
	order: Srv('cart.order'),
}

const mutations = make.mutations(state)

const actions = make.actions(state)

const getters = {}

export default {
	name: 'cart',
	namespaced: true,
	state,
	mutations,
	actions,
	getters,
}
