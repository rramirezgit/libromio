<script>
export default {
	name: 'RegisteredUsers',
	data: () => ({
		currentItem: 'tab-profile-info',
	}),
	created() {
		this.$store.set('app/title', 'Usuarios registrados')
	},
}
</script>

<template>
	<RegisteredUsersTable />
</template>
