// Pathify
import { make } from 'vuex-pathify'

// Data
const state = {
	order: null,
	hash: null,
	steps: null,
}

const mutations = make.mutations(state)
const actions = make.actions(state)
const getters = {}

export default {
	name: 'checkout',
	namespaced: true,
	state,
	mutations,
	actions,
	getters,
}
