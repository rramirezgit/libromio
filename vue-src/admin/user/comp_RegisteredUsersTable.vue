<script>
import { get } from 'vuex-pathify'

//import { isEqual } from 'lodash'

export default {
	name: 'RegisteredUsersTable',
	data() {
		return {
			loading: true,
			firstLoad: true,
			headers: [
				{ text: 'REGISTRO', value: 'createdAt', sortable: true },
				{ text: 'EMAIL', value: 'email', sortable: false },
				{ text: 'NOMBRE', value: 'fullname', sortable: false },
				{ text: 'TELEFONO', value: 'phone', sortable: false },
				{ text: '', value: 'blacklisted', sortable: false },
				{ text: 'Actions', value: 'actions', sortable: false },
			],
			serverPagination: {
				itemsLength: 0,
			},
			users: [],
			filters: {},
			tableOptions: {},
			searchText: '',
			doReplace: false,
			doNotReact: false,
			activeUser: null,
		}
	},

	computed: {
		query: get('route@query'),
		pagProps() {
			let pag = this.serverPagination
			return {
				itemsPerPageOptions: [10, 25, 50, 100],
				itemsPerPageText: 'Resultados por página:',
				showFirstLastPage: true,
				pageText: `${pag.fromItem}-${pag.toItem} de ${pag.itemsLength}`,
			}
		},
	},
	watch: {
		filters: {
			handler: function() {
				if (this.doNotReact) return
				if (this.tableOptions.page != 1) {
					this.tableOptions.page = 1
				} else {
					this.updateUrl()
				}
			},
			deep: true,
		},
		tableOptions: {
			handler: function() {
				if (this.doNotReact) return
				this.updateUrl()
			},
			deep: true,
		},
		query: {
			handler() {
				this.doNotReact = true
				this.getUsers()
			},
			deep: true,
		},
	},
	created() {
		this.doReplace = true
		this.doNotReact = true
		this.queryToTableOptions()
		this.queryToFilters()
		if (!this.updateUrl()) {
			this.getUsers()
		}
	},
	methods: {
		async getUsers() {
			this.doNotReact = true
			this.queryToTableOptions()
			this.queryToFilters()
			this.users = []
			let { data } = await this.$adminApi.get({
				url: '/users/users',
				loading: (v) => (this.loading = v),
				query: this.query,
			})

			if (data.pagination.page != this.query.page) {
				this.doReplace = true
				this.tableOptions.page = data.pagination.page
			} else {
				this.users = data.users
				this.serverPagination = data.pagination
			}
			this.doNotReact = false
		},
		tableOptionsToQuery() {
			return {
				page: this.tableOptions.page,
				itemsPerPage: this.tableOptions.itemsPerPage,
				sortDesc: this.tableOptions.sortDesc[0],
			}
		},
		queryToTableOptions() {
			this.tableOptions = {
				page: Number(this.query.page) || 1,
				itemsPerPage: Number(this.query.itemsPerPage) || 50,
				sortBy: ['createdAt'],
				sortDesc: [this.query.sortDesc === 'false' ? false : true],
			}
		},
		filtersToQuery() {
			return this.filters
		},
		queryToFilters() {
			this.searchText = this.query.search
			this.filters = {
				search: this.query.search || null,
				//categoryId: Number(this.query.categoryId) || null,
				//tagId: Number(this.query.tagId) || null,
				//collectionId: Number(this.query.collectionId) || null,
			}
		},
		onSearchChanged() {
			this.filters.search = this.searchText
		},
		onSearchCleanup() {
			this.filters.search = ''
		},
		updateUrl() {
			let query = {
				...this.tableOptionsToQuery(),
				...this.filtersToQuery(),
			}
			let equal = true
			for (let k in query) {
				if (!query[k]) delete query[k]
				else if (String(query[k]) != this.query[k]) equal = false
			}
			if (equal && Object.keys(this.query).length == Object.keys(query).length) {
				return false
			}
			if (this.doReplace) {
				this.doReplace = false
				this.$router.replace({ query })
			} else {
				this.$router.push({ query })
			}
			return true
		},
	},
}
</script>

<template>
	<div>
		<v-data-table
			:loading="loading"
			:headers="headers"
			:items="users"
			:footer-props="pagProps"
			:options.sync="tableOptions"
			:server-items-length="serverPagination.itemsLength"
			class="elevation-4"
			must-sort
		>
			<template v-slot:top="{ pagination }">
				<v-toolbar flat height="auto">
					<cont>
						<row>
							<c md="6">
								<TextField
									v-model="searchText"
									@blur="onSearchChanged"
									@keydown.enter="onSearchChanged"
									@click:append="onSearchChanged"
									@click:clear="onSearchCleanup"
									label="Búsqueda"
									placeholder="Buscar nombre / apellido / email / telefono"
									append-icon="mdi-magnify"
									dense
									clearable
								/>
							</c>
						</row>
					</cont>
				</v-toolbar>
				<v-data-footer :pagination="pagination" :options.sync="tableOptions" v-bind="pagProps" />
			</template>
			<template #item.createdAt="{ value: createdAt }">
				<div class="py-2">
					{{ createdAt | date }}<br /><small>{{ createdAt | time }}</small>
				</div>
			</template>
			<template #item.email="{ item: user }">
				{{ user.accountEmail }}
				<div v-if="user.accountEmail != user.contactEmail">
					{{ user.contactEmail }}
				</div>
			</template>
			<template #item.fullname="{ item: user }">
				<span v-if="user.firstname || user.lastname"> {{ user.firstname }} {{ user.lastname }} </span>
				<span v-else>-</span>
			</template>
			<template #item.phone="{ item: user }">
				<span v-if="user.phoneNumber">({{ user.phonePrefix || '-' }}) {{ user.phoneNumber }}</span>
				<span v-else>-</span>
			</template>
			<template #item.blacklisted="{ value }">
				<small v-if="value" class="d-inline px-2 py-1 black white--text rounded">
					BLACKLIST
				</small>
			</template>
			<template #item.actions="{ item: user }">
				<v-btn @click="activeUser = user" color="primary" icon>
					<v-icon>mdi-pencil</v-icon>
				</v-btn>
			</template>
		</v-data-table>
		<RegisteredUsersDialog v-model="activeUser" @blacklisted="activeUser.blacklisted = $event" />
	</div>
</template>
