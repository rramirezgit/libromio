// Pathify
import { make } from 'vuex-pathify'

// Data
const state = {
	initialized: false,
	title: '',
	admin: null,
	routes: null,
	drawer: null,
	mini: false,
}

const mutations = make.mutations(state)

const actions = make.actions(state)

const getters = {}

export default {
	name: 'app',
	namespaced: true,
	state,
	mutations,
	actions,
	getters,
}
