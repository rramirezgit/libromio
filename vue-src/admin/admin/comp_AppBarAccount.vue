<script>
export default {
	name: 'AppBarAccount',
	methods: {
		async logout() {
			await this.$adminApi.get('/logout')
		},
	},
}
</script>

<template>
	<v-menu bottom left min-width="200" offset-y origin="top right" transition="scale-transition">
		<template v-slot:activator="{ attrs, on }">
			<v-btn class="ml-2" min-width="0" text v-bind="attrs" v-on="on">
				<v-icon>mdi-account</v-icon>
			</v-btn>
		</template>

		<v-list flat nav>
			<AppBarListItem :to="{ name: 'profile' }">
				<v-list-item-title>Mi cuenta</v-list-item-title>
			</AppBarListItem>
			<AppBarListItem :to="{ name: 'admin-users' }">
				<v-list-item-title>Administrar usuarios</v-list-item-title>
			</AppBarListItem>
			<v-divider class="mb-2 mt-2" />
			<AppBarListItem @click="logout">
				<v-list-item-title>Salir</v-list-item-title>
			</AppBarListItem>
		</v-list>
	</v-menu>
</template>
