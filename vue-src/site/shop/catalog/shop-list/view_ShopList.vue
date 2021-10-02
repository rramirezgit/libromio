<script>
import { get } from 'vuex-pathify'
const SHOP_ALL_KEYWORD = process.env.VUE_APP_SHOP_ALL_KEYWORD
const _cachedResults = {}

export default {
	metaInfo() {
		let title = this.loading ? '...' : this.shop?.context?.title.replace('/', '>') || 'Shop'
		let description = this.loading ? null : this.shop?.context?.description || title
		return { title, meta: [{ vmid: 'd', name: 'description', content: description }] }
	},
	data() {
		return {
			loading: false,
			showFiltersDrawer: false,
			shop: {
				products: [],
				pagination: {
					links: 1,
					itemsLength: 0,
				},
				possibleFilters: {},
				removalChips: [],
				breadcrumbs: [],
				meta: {},
				context: {},
			},
			currentRouteData: null,
		}
	},

	watch: {
		routeParams: {
			handler() {
				this.loadData()
			},
			deep: true,
		},
		routeSearch() {
			this.loadData()
		},
	},
	methods: {
		routeToData() {
			let { filters } = this.routeParams
			if (typeof filters == 'string') {
				filters = filters.split('/').filter((str) => !!str.trim())
			}
			if (!filters.length) return false

			let data = { filters: [] }
			let subFilters = [
				{
					re: /^marca-(.+)$/,
					onMatch: (m) => {
						data.brand = m[1]
					},
				},
				{
					re: /^desde-([0-9]+)(-hasta-([0-9]+))?$/,
					onMatch: (m) => {
						data.fromPrice = m[1]
						data.toPrice = m[3]
					},
				},
				{
					re: /^ordernar-por-(.+)$/,
					onMatch: (m) => {
						data.sortBy = m[1]
					},
				},
				{
					re: /^(.+)--(.+)$/,
					repeat: true,
					onMatch: (m) => {
						data.attrs = data.attrs || {}
						data.attrs[m[1]] = m[2]
					},
				},
				{
					re: /^[0-9]+$/,
					onMatch: (m) => {
						data.page = m[0]
					},
				},
			]

			let subFilterIndex = -1
			for (let filter of filters) {
				filter = String(filter)

				let subFilter = subFilters.find((subFilter, i) => {
					if (i < subFilterIndex) return false
					let m = filter.match(subFilter.re)
					if (!m) return false
					subFilter.onMatch(m)
					subFilterIndex = subFilter.repeat ? i : i + 1
					return true
				})

				if (subFilterIndex == -1) {
					data.filters.push(filter)
				} else if (!subFilter || !data.filters.length) {
					return false
				}
			}

			data.page = Math.max(1, parseInt(data.page || 1))
			data.search = this.routeSearch
			return data
		},
		dataToRoute(data = {}) {
			let filters = [...(data.filters || [SHOP_ALL_KEYWORD])]

			if (data.brand) {
				filters.push(`marca-${data.brand}`)
			}
			let { fromPrice, toPrice } = data
			if (isNaN(fromPrice) || fromPrice < 0) fromPrice = 0
			if (isNaN(toPrice) || toPrice <= 0 || (fromPrice && toPrice < fromPrice)) {
				toPrice = null
			}
			if (fromPrice || toPrice) {
				let filterStrs = []
				filterStrs.push(`desde-${parseInt(fromPrice)}`)
				if (toPrice) filterStrs.push(`hasta-${parseInt(toPrice)}`)
				filters.push(filterStrs.join('-'))
			}
			if (data.sortBy) {
				filters.push(`ordernar-por-${data.sortBy}`)
			}
			if (data.attrs) {
				Object.entries(data.attrs)
					.sort((a, b) => (a[0] > b[0] ? 1 : -1))
					.forEach((attr) => {
						filters.push(`${attr[0]}--${attr[1]}`)
					})
			}
			let page = data.page
			if (page && !isNaN(page) && page > 1) {
				filters.push(page)
			}

			let route = { params: { filters } }
			let { search } = data
			if (search) route.query = { search }
			return route
		},
		loadData() {
			if (this.loading) return
			this.showFiltersDrawer = false
			let data = this.routeToData()
			this.currentRouteData = data
			if (data === false) {
				//404
			}

			let cachedShop = this.getCache()
			if (cachedShop === false) {
				//404
			} else if (cachedShop) {
				return Object.assign(this.shop, cachedShop)
			}

			this.$shopApi.post({
				url: '/catalog/shop',
				data,
				loading: (v) => (this.loading = v),
				onSuccess: ({ data }) => {
					this.setCache(data.shop)
					if (data.shop === false) {
						//404
					} else {
						Object.assign(this.shop, data.shop)
					}
				},
			})
		},
		getCurrFiltersStr() {
			let { filters: str } = this.routeParams
			if (Array.isArray(str)) str = str.join('/')
			if (this.routeSearch) str += `?search=${this.routeSearch}`
			return str
		},
		setCache(shop) {
			let key = this.getCurrFiltersStr()
			_cachedResults[key] = { shop, at: Date.now() }
		},
		getCache() {
			let key = this.getCurrFiltersStr()
			if (!_cachedResults[key]) return null
			let { shop, at } = _cachedResults[key]
			//3 minutes
			if (Date.now() - at > 60000 * 3) {
				delete _cachedResults[key]
				return null
			}
			return shop
		},
		toggleShopAllKeyword(filters, b) {
			if (b && !filters.length) {
				filters.push(SHOP_ALL_KEYWORD)
			} else if (!b && filters[0] == SHOP_ALL_KEYWORD) {
				filters.splice(0, 1)
			}
		},
		updateFilter({ type, value }, added) {
			let data = { ...this.currentRouteData }
			let { filters } = data

			if (type == 'brand') {
				data.brand = added ? value : null
			} else if (type == 'collection') {
				if (added) {
					this.toggleShopAllKeyword(filters, false)
					filters.unshift(value)
				} else {
					filters.shift()
					this.toggleShopAllKeyword(filters, true)
				}
			} else if (type == 'category') {
				if (added) {
					this.toggleShopAllKeyword(filters, false)
					filters.push(value)
				} else {
					filters.pop()
					this.toggleShopAllKeyword(filters, true)
				}
			} else if (type == 'sortBy') {
				data.sortBy = added ? value : null
			} else if (type == 'priceRange') {
				if (added) {
					let [fromPrice, toPrice] = value
					data.fromPrice = fromPrice
					data.toPrice = toPrice
				} else {
					data.fromPrice = data.toPrice = null
				}
			} else if (type == 'attr') {
				data.attrs = data.attrs || {}
				if (added) data.attrs[value[0]] = value[1]
				else delete data.attrs[value[0]]
			} else if (type == 'search') {
				if (!added) data.search = null
			}
			data.page = null
			this.pushRoute(data)
		},
		updatePage(page) {
			this.pushRoute({ ...this.currentRouteData, page })
		},
		updateCategory(urlNames) {
			let data = { ...this.currentRouteData }
			let { filters } = data
			let isCollectionFiltered = !!this.shop.removalChips.find((rc) => rc.type == 'collection')
			let index = isCollectionFiltered ? 1 : 0
			filters.splice(index, filters.length, ...urlNames)
			this.toggleShopAllKeyword(filters, true)
			data.page = null
			this.pushRoute(data)
		},
		pushRoute(data) {
			let route = this.dataToRoute(data)
			this.$router.push(route)
		},
		toggleDrawer() {
			this.showFiltersDrawer = !this.showFiltersDrawer
		},
	},
	created() {
		this.loadData()
	},
	computed: {
		routeParams: get('route@params'),
		routeSearch: get('route@query.search'),
		size() {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					return 'xs'
				case 'sm':
					return 'xs'
				default:
					return 'other'
			}
		},
		ratio() {
			return this.size != 'xs' ? 1920 / 300 : 800 / 300
		},
		collectionImage() {
			return this.size != 'xs' ? this.shop.context.imageUrl : this.shop.context.imageMobileUrl
		},
	},
}
</script>

<template>
	<div>
		<Container fluid class="pa-0 pb-6" v-if="shop.context.imageUrl">
			<v-img :aspect-ratio="ratio" :src="collectionImage" />
		</Container>
		<DefaultProducts v-if="shop.products == 0 && !loading" />
		<Container v-else class="pa-0 mt-12">
			<v-row>
				<v-col cols="12" class=" d-md-none">
					<div class="font-6 is-heading font-weight-bold text-uppercase mb-5">
						{{ shop.context.title }}
					</div>
					<MobileFilterBtn @toggleDrawer="toggleDrawer" />
				</v-col>
				<v-col cols="12" md="3" class="d-none d-md-block">
					<ShopFilters
						:loading="loading"
						:title="shop.context.title"
						:breadcrumbs="shop.breadcrumbs"
						:total-results="shop.pagination.itemsLength"
						:category-items="shop.possibleFilters.category"
						:brand-items="shop.possibleFilters.brand"
						:collection-items="shop.possibleFilters.collection"
						:attrs-groups="shop.possibleFilters.attrsGroups"
						:sort-by-items="shop.possibleFilters.sortBy"
						:removal-chips="shop.removalChips"
						@filterAdded="updateFilter($event, true)"
						@filterRemoved="updateFilter($event, false)"
						@breadcrumbClicked="updateCategory($event)"
					/>
				</v-col>
				<v-col cols="12" md="9" class="pa-0">
					<ProductsLayout
						:loading="loading"
						:products="shop.products"
						:pagination-props="{
							totalVisible: shop.pagination.links.length,
							value: shop.pagination.page,
							length: shop.pagination.lastPage,
						}"
						@updatePage="updatePage($event)"
					/>
				</v-col>
				<v-navigation-drawer
					class="pa-4 pr-0 pl-0"
					:value="showFiltersDrawer"
					stateless
					fixed
					width="600"
				>
					<v-list-item class="px-2">
						<div class="pl-4">
							FILTRAR / ORDENAR
						</div>
						<v-spacer></v-spacer>
						<v-btn :ripple="false" plain text @click="toggleDrawer">
							<v-icon x-large>mdi-close-circle</v-icon>
						</v-btn>
					</v-list-item>
					<v-divider class="mb-4"></v-divider>
					<div class="pl-5">
						<ShopFilters
							:loading="loading"
							:title="shop.context.title"
							:breadcrumbs="shop.breadcrumbs"
							:total-results="shop.pagination.itemsLength"
							:category-items="shop.possibleFilters.category"
							:brand-items="shop.possibleFilters.brand"
							:collection-items="shop.possibleFilters.collection"
							:attrs-groups="shop.possibleFilters.attrsGroups"
							:sort-by-items="shop.possibleFilters.sortBy"
							:removal-chips="shop.removalChips"
							@filterAdded="updateFilter($event, true)"
							@filterRemoved="updateFilter($event, false)"
							@breadcrumbClicked="updateCategory($event)"
						/>
					</div>
				</v-navigation-drawer>
			</v-row>
		</Container>
	</div>
</template>
