import ProfileView from './view_Profile.vue'
import AdminsListView from './view_AdminsList.vue'

export default [
	{
		path: `/profile`,
		name: 'profile',
		component: ProfileView,
	},
	{
		path: '/admin-users',
		name: 'admin-users',
		component: AdminsListView,
	},
]
