<script>
import { get } from 'vuex-pathify'
//import { isEqual } from 'lodash'

export default {
	name: 'ProductsTable',
	data() {
		return {
			loading: true,
			firstLoad: true,
			headers: [
				{ text: 'IMAGEN', value: 'mainImage', sortable: false },
				{ text: 'SKU', value: 'sku' },
				{ text: 'PRODUCTO', value: 'name' },
				{ text: 'CATEGORÍA', value: 'categories' },
				{ text: 'PUBLICACIÓN', value: 'pub', sortable: false },
				{ text: 'ACCIONES', value: 'actions', sortable: false },
			],
			serverPagination: {
				itemsLength: 0,
			},
			products: [],
			filters: {},
			tableOptions: {},
			searchText: '',
			doReplace: false,
			doNotReact: false,
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
				this.getProducts()
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
			this.getProducts()
		}
	},
	methods: {
		async getProducts() {
			this.doNotReact = true
			this.queryToTableOptions()
			this.queryToFilters()
			this.products = []
			let { data } = await this.$adminApi.get({
				url: '/catalog/products',
				loading: (v) => (this.loading = v),
				query: this.query,
			})

			if (data.pagination.page != this.query.page) {
				this.doReplace = true
				this.tableOptions.page = data.pagination.page
			} else {
				data.products.forEach((prod) => {
					prod.categories.sort((a, b) => a.pos - b.pos)
				})
				this.products = data.products
				this.serverPagination = data.pagination
			}
			this.doNotReact = false
		},
		tableOptionsToQuery() {
			return {
				page: this.tableOptions.page,
				itemsPerPage: this.tableOptions.itemsPerPage,
				sortBy: this.tableOptions.sortBy[0],
				sortDesc: this.tableOptions.sortDesc[0],
			}
		},
		queryToTableOptions() {
			this.tableOptions = {
				page: Number(this.query.page) || 1,
				itemsPerPage: Number(this.query.itemsPerPage) || 10,
				sortBy: [this.query.sortBy || 'name'],
				sortDesc: [this.query.sortDesc === 'true'],
			}
		},
		filtersToQuery() {
			return this.filters
		},
		queryToFilters() {
			this.searchText = this.query.search
			this.filters = {
				search: this.query.search || null,
				categoryId: Number(this.query.categoryId) || null,
				tagId: Number(this.query.tagId) || null,
				collectionId: Number(this.query.collectionId) || null,
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
	<v-data-table
		:loading="loading"
		:headers="headers"
		:items="products"
		:footer-props="pagProps"
		:options.sync="tableOptions"
		:server-items-length="serverPagination.itemsLength"
		class="elevation-4"
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
								placeholder="Buscar nombre / sku"
								append-icon="mdi-magnify"
								dense
								clearable
							/>
						</c>
						<c md="6">
							<CategorySelector
								dense
								label="Filtrar categoría"
								v-model="filters.categoryId"
								clearable
							/>
						</c>
						<c md="6">
							<TagSelector
								dense
								label="Filtrar Tag"
								v-model="filters.tagId"
								return-prop="id"
								clearable
							/>
						</c>
						<c md="6">
							<CollectionSelector
								dense
								label="Filtrar Colección"
								v-model="filters.collectionId"
								clearable
							/>
						</c>
					</row>
				</cont>
				<v-divider class="mx-4" inset vertical></v-divider>
				<v-btn color="primary" class="mb-2" :to="{ name: 'products.single', params: { id: 'new' } }"
					><v-icon>mdi-plus</v-icon> Crear producto
				</v-btn>
			</v-toolbar>
			<v-data-footer :pagination="pagination" :options.sync="tableOptions" v-bind="pagProps" />
		</template>
		<template v-slot:item.mainImage="{ item }">
			<div class="py-2">
				<v-img
					:src="item.mainImage.squareUrl"
					v-if="item.mainImage"
					width="100"
					height="100"
					class="pa-2 rounded"
					style="border: 1px solid #bbb"
				/>
			</div>
		</template>
		<template v-slot:item.sku="{ item }">
			{{
				item.variants
					.map((variant) => variant.sku)
					.sort()
					.join(' / ')
			}}
		</template>
		<template v-slot:item.categories="{ value }">
			{{ value.map((cat) => cat.name).join(' > ') }}
		</template>
		<template v-slot:item.pub="{ item }">
			<i v-if="!item.complete" class="error--text">
				Incompleta
			</i>
			<span v-else-if="item.active && item.activeFrom" class="warning--text">
				Programada para {{ item.activeFrom | date }}
			</span>
			<b v-else-if="item.active" class="success--text">
				Activa
			</b>
			<span v-else class="grey--text">
				Pausada
			</span>
		</template>
		<template v-slot:item.actions="{ item }">
			<v-btn :to="{ name: 'products.single', params: { id: item.id } }" color="primary" text>
				<v-icon>
					mdi-pencil
				</v-icon>
			</v-btn>
		</template>
	</v-data-table>
</template>
