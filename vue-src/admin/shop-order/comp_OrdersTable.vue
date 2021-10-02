<script>
import { get } from 'vuex-pathify'

//import { isEqual } from 'lodash'

export default {
	name: 'OrdersTable',
	data() {
		return {
			loading: true,
			firstLoad: true,
			headers: [
				{ text: 'FECHA', value: 'confirmedAt' },
				{ text: 'CÓDIGO', value: 'code', sortable: false },
				{ text: 'CONTACTO', value: 'buyer', sortable: false },
				{ text: 'TOTAL', value: 'total', sortable: false },
				{ text: 'ESTADO', value: 'status', sortable: false },
				{ text: 'ENTREGA', value: 'delivery', sortable: false },
			],
			serverPagination: {
				itemsLength: 0,
			},
			orders: [],
			filters: {},
			tableOptions: {},
			searchText: '',
			doReplace: false,
			doNotReact: false,
			dialogOrder: null,
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
			handler: function () {
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
			handler: function () {
				if (this.doNotReact) return
				this.updateUrl()
			},
			deep: true,
		},
		query: {
			handler() {
				this.doNotReact = true
				this.getOrders()
			},
			deep: true,
		},
	},
	methods: {
		async getOrders() {
			this.doNotReact = true
			this.queryToTableOptions()
			this.queryToFilters()
			this.orders = []
			let { data } = await this.$adminApi.get({
				url: '/sales/orders',
				loading: (v) => (this.loading = v),
				query: this.query,
			})

			if (data.pagination.page != this.query.page) {
				this.doReplace = true
				this.tableOptions.page = data.pagination.page
			} else {
				this.orders = data.orders
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
				itemsPerPage: Number(this.query.itemsPerPage) || 25,
				sortBy: ['confirmedAt'],
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
		gotoOrderDetail(order) {
			this.$router.push({ name: 'orders.single', params: { id: order.id } })
		},
		copyToClipboard(str) {
			navigator.clipboard.writeText(str)
		},
	},
	created() {
		this.doReplace = true
		this.doNotReact = true
		this.queryToTableOptions()
		this.queryToFilters()
		if (!this.updateUrl()) {
			this.getOrders()
		}
	},
}
</script>

<template>
	<div>
		<v-data-table
			:loading="loading"
			:headers="headers"
			:items="orders"
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
									placeholder="Buscar id / código / usuario / contacto / facturación"
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
			<template #item.confirmedAt="{ item: order }">
				{{ order.confirmedAt | date }}<br />
				{{ order.confirmedAt | time }}
			</template>
			<template #item.code="{ item: order, value: code }">
				<div class="d-flex align-center">
					<Button text small color="link" class="py-6" @click="gotoOrderDetail(order)">
						#{{ code }}
					</Button>
					<Button icon @click="copyToClipboard(code)">
						<v-icon small>mdi-content-copy</v-icon>
					</Button>
				</div>
			</template>
			<template #item.buyer="{ value: buyer }">
				<div class="py-2">
					<div>{{ buyer.firstname }} {{ buyer.lastname }}</div>
					<div class="text-no-wrap">{{ buyer.email }}</div>
					<div class="text-no-wrap">({{ buyer.phonePrefix }}) {{ buyer.phoneNumber }}</div>
				</div>
			</template>
			<template #item.total="{ item: order, value: total }">
				<div class="text-no-wrap">{{ total | price }}</div>
				<div>
					<small>{{ order.items.reduce((s, item) => s + item.qty, 0) }} producto/s</small>
				</div>
			</template>
			<template #item.status="{ item: order }">
				<template v-for="s in [order.statusesInfo.title]">
					<div
						:key="s.name"
						class="d-inline py-1 px-2 rounded text-no-wrap"
						:class="`${s.color} lighten-5 ${s.color}--text text--darken-2`"
					>
						<small>{{ s.name }}</small>
					</div>
				</template>
			</template>
			<template #item.delivery="{ item: order }">
				<div v-if="order.delivery">
					{{ order.delivery.methodName }}<br />{{ order.delivery.optionName }}
				</div>
				<span v-else>-</span>
			</template>
		</v-data-table>
		<!-- <OrderDialog v-model="dialogOrder" /> -->
	</div>
</template>
