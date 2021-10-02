<script>
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'CategorySelector',
	mixins: [inputMixin],
	props: {
		categoryId: [Number, Array],
		label: {
			type: String,
			default: 'Categoría',
		},
		familyJoiner: {
			type: String,
			default: '>',
		},
		onlyBottomCategories: Boolean,
		canCreate: Boolean,
		maxDeep: {
			type: Number,
			default: 0,
		},
	},
	model: {
		prop: 'categoryId',
		event: 'updateModel',
	},
	data() {
		return {
			items: [],
			inputText: null,
			activeCategory: null,
			orderedCategoryItems: [],
			loading: false,
		}
	},
	computed: {
		itemsList() {
			return this.getCategoriesList(this.items)
		},
	},
	methods: {
		async loadData() {
			await this.$adminApi.get({
				loading: (v) => (this.loading = v),
				url: '/catalog/categories',
				query: { tree: true },
				onSuccess: ({ data }) => {
					this.items = this.setCategoriesFamilyRecursively(data.categories)
				},
				cache: true,
			})
		},
		onInput(categoryId) {
			this.$emit('updateModel', categoryId)
		},
		focus() {
			this.$refs.autocomplete.focus()
		},
		async onCategoryCreated(categoryId) {
			await this.loadData()
			this.onInput(categoryId)
		},
		setCategoriesFamilyRecursively(categories, _parent = null) {
			for (let category of categories) {
				category.family = _parent ? [].concat(_parent.family) : []
				category.family.push(category)
				category.fullName = category.family.map((cat) => cat.name).join(` ${this.familyJoiner} `)
				this.setCategoriesFamilyRecursively(category.children, category)
			}
			return categories
		},
		getCategoriesList(categories, _list = null) {
			let list = _list || []
			for (let category of categories) {
				if (this.onlyBottomCategories) {
					if (!category.children.length) list.push(category)
				} else if (this.maxDeep > 0) {
					if (category.pos > this.maxDeep) continue
				} else {
					list.push(category)
				}
				this.getCategoriesList(category.children, list)
			}
			return list
		},
	},

	async created() {
		await this.loadData()
	},
}
</script>

<template>
	<div>
		<Autocomplete
			ref="autocomplete"
			:label="label"
			placeholder="Buscar..."
			:value="categoryId"
			@input="onInput"
			:items="itemsList"
			item-text="fullName"
			item-value="id"
			:loading="loading"
			:search-input.sync="inputText"
			:hide-no-data="loading"
			no-data-text="No se han encontrado resultados..."
			:error-messages="validationErrors"
			v-bind="$attrs"
		>
			<template v-slot:append>
				<v-btn v-if="canCreate" @click="activeCategory = {}" text color="success" x-small>
					<v-icon>mdi-plus</v-icon> Crear
				</v-btn>
			</template>
		</Autocomplete>
		<CategoryDialog v-model="activeCategory" @saved="onCategoryCreated" v-if="canCreate" />
	</div>
</template>
