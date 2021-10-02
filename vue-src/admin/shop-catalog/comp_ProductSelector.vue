<script>
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'ProductSelector',
	mixins: [inputMixin],
	props: {
		selectorModel: [String, Array],
		label: {
			type: String,
			default: 'Productos',
		},
		multiple: {
			type: Boolean,
			default: true,
		},
	},
	model: {
		prop: 'selectorModel',
		event: 'updateModel',
	},
	data() {
		return {
			items: [],
			selectedItems: this.multiple ? [] : null,
			inputText: null,
			loading: false,
			searchId: 0,
		}
	},
	watch: {
		inputText(value) {
			this.loading = true
			let searchText = (value || '').trim()
			this.searchId += 1
			let searchId = this.searchId
			setTimeout(() => this.searchProducts(searchId, searchText), 1000)
		},
		selectedItems(value) {
			if (this.multiple) {
				this.$emit(
					'updateModel',
					value.map((item) => item.id)
				)
			} else {
				this.$emit('updateModel', value ? value.id : null)
			}
		},
	},
	computed: {
		mergedItems() {
			let items = [...this.items]
			let sItems = this.multiple ? this.selectedItems : [this.selectedItems]
			for (let sItem of sItems) {
				if (!items.find((item) => item.id == sItem.id)) {
					items.push(sItem)
				}
			}
			return items
		},
	},
	methods: {
		async searchProducts(searchId, searchText) {
			if (this.searchId != searchId) return

			if (searchText.length < 2) {
				this.items = []
				this.loading = false
				return
			}

			await this.$adminApi.get({
				loading: (v) => (this.loading = v),
				url: '/catalog/products',
				query: {
					page: 1,
					scope: 'autocomplete',
					itemsPerPage: 20,
					search: searchText,
				},
				onSuccess: ({ data }) => {
					if (this.searchId != searchId) return
					this.items = data.products
				},
			})
		},
		focus() {
			this.$refs.autocomplete.focus()
		},
		remove(item) {
			if (this.multiple) {
				const index = this.selectedItems.findIndex((_item) => _item.id == item.id)
				if (index >= 0) this.selectedItems.splice(index, 1)
			} else {
				this.selectedItems = null
			}
		},
		fakeFilter() {
			return true
		},
	},
	async created() {
		let ids = this.selectorModel
		if (Array.isArray(ids)) ids = ids.join(',')
		if (!ids) return
		await this.$adminApi.get({
			loading: (v) => (this.loading = v),
			url: '/catalog/products',
			query: { ids, scope: 'autocomplete' },
			onSuccess: ({ data }) => {
				this.items = data.products
				this.selectedItems = data.products
			},
		})
	},
}
</script>

<template>
	<Autocomplete
		ref="autocomplete"
		:label="label"
		placeholder="Buscar nombre / sku..."
		v-model="selectedItems"
		:items="mergedItems"
		item-value="id"
		:loading="loading"
		:search-input.sync="inputText"
		:hide-no-data="true"
		no-data-text="No se han encontrado resultados..."
		:error-messages="validationErrors"
		:multiple="multiple"
		v-bind="$attrs"
		chips
		:filter="fakeFilter"
		hide-selected
		return-object
	>
		<template v-slot:selection="{ attrs, select, selected, item }">
			<v-chip v-bind="attrs" :input-value="selected" close @click="select" @click:close="remove(item)">
				<!-- <v-avatar left>
					<v-img :src="data.item.avatar"></v-img>
				</v-avatar> -->
				{{ item.name.length > 16 ? item.name.substr(0, 14) + '...' : item.name }}
				<small class="text--secondary ml-2">
					(SKU {{ item.variants[0].sku }}{{ item.variants.length > 1 ? ', ...' : '' }})
				</small>
			</v-chip>
		</template>
		<template v-slot:item="{ item }">
			<v-list-item-avatar>
				<img :src="item.mainImage.squareUrl" v-if="item.mainImage" />
			</v-list-item-avatar>
			<v-list-item-content>
				<v-list-item-title>{{ item.name }}</v-list-item-title>
				<v-list-item-subtitle>
					SKU {{ item.variants.map((v) => v.sku).join(' - ') }}
				</v-list-item-subtitle>
			</v-list-item-content>
		</template>
	</Autocomplete>
</template>
