<script>
export default {
	name: 'AdminsList',
	data() {
		return {
			loading: false,
			search: '',
			headers: [
				{ text: 'USUARIO', value: 'username' },
				{ text: 'EMAIL', value: 'email' },
				{
					text: 'NOMBRE',
					value: 'firstname',
				},
				{
					text: 'PERMISOS',
					value: 'permissions',
				},
				{
					text: 'Actions',
					value: 'actions',
					sortable: false,
				},
			],
			users: [],
			activeAdmin: null,
		}
	},
	methods: {
		async loadData() {
			await this.$adminApi.get({
				url: '/admin/users',
				loading: (v) => (this.loading = v),
				onSuccess: ({ data }) => {
					this.users = data.users
				},
				cache: true,
			})
		},
		onUserUpdate() {
			this.loadData()
		},
		printPermissions(permissions) {
			let permString = permissions.map((item) => {
				return item.name
			})
			return permString.join(', ')
		},
	},
	created() {
		this.loadData()
		this.$store.set('app/title', 'Administrar usuarios')
	},
}
</script>

<template>
	<div>
		<v-data-table
			:headers="headers"
			:items="users"
			:loading="loading"
			sort-by="username"
			:search="search"
			class="elevation-4"
			hide-default-footer
		>
			<template #top>
				<v-toolbar flat>
					<v-toolbar-title>Usuarios</v-toolbar-title>
					<v-divider class="mx-4" inset vertical></v-divider>
					<TextField
						v-model="search"
						append-icon="mdi-magnify"
						label="Buscar..."
						single-line
						hide-details
						dense
					/>
					<v-divider class="mx-4" inset vertical></v-divider>
					<v-btn color="primary" class="mb-2" @click="activeAdmin = {}">
						<v-icon>mdi-plus</v-icon> Crear Usuario
					</v-btn>
				</v-toolbar>
			</template>
			<template #item.permissions="{ item }">
				<div>
					{{ printPermissions(item.permissions) }}
				</div>
			</template>
			<template #item.firstname="{ item }">
				<div>
					{{ `${item.firstname} ${item.lastname}` }}
				</div>
			</template>
			<template #item.actions="{ item }">
				<v-btn @click="activeAdmin = item" color="primary" text>
					<v-icon>
						mdi-pencil
					</v-icon>
				</v-btn>
			</template>
		</v-data-table>
		<AdminDialog v-model="activeAdmin" @saved="loadData" @deleted="loadData" />
	</div>
</template>
