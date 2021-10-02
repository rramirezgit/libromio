<script>
export default {
	name: 'TagSelector',
	props: {
		model: [Number, String, Array],
		label: String,
		multiple: Boolean,
		canCreate: Boolean,
		returnProp: String,
	},
	model: {
		prop: 'model',
		event: 'updateModel',
	},
	data() {
		return {
			selectedItems: null,
			items: [],
			loading: false,
			inputText: '',
		}
	},
	methods: {
		async loadData() {
			await this.$adminApi.get({
				url: '/catalog/tags',
				onSuccess: ({ data }) => {
					this.items = data.tags
					let model = Array.isArray(this.model) ? this.model : [this.model]
					let prop = this.returnProp || 'name'
					let sItems = model
						.filter((item) => !!item)
						.map((value) => {
							value = this.returnProp ? value : value.name
							let item = this.items.find((_item) => _item[prop] == value)
							return item ? item.name : null
						})
						.filter((item) => !!item)
					this.selectedItems = this.multiple ? sItems : sItems[0]
				},
				loading: (v) => (this.loading = v),
			})
		},
	},
	watch: {
		selectedItems(value) {
			if (!value || (this.multiple && !value.length)) {
				return this.$emit('updateModel', value)
			}

			value = Array.isArray(value) ? value : [value]
			let items = value.map((name) => {
				let item = this.items.find((item) => item.name == name)
				if (this.returnProp) {
					return item ? item[this.returnProp] : name
				} else {
					return item || { name }
				}
			})
			this.$emit('updateModel', this.multiple ? items : items[0])
		},
	},
	async created() {
		await this.loadData()
	},
}
</script>

<template>
	<component
		:is="canCreate ? 'Combobox' : 'Autocomplete'"
		:label="label || 'Tags / Etiquetas'"
		v-model="selectedItems"
		:items="items"
		item-text="name"
		item-value="name"
		:return-object="false"
		:loading="loading"
		:placeholder="canCreate ? 'Buscar o crear etiquetas...' : 'Buscar...'"
		hide-selected
		:hint="
			canCreate ? 'Para insertar presionar Coma (,) Espacio o ENTER' : ''
		"
		persistent-hint
		:multiple="multiple"
		small-chips
		:delimiters="[' ', ',']"
		v-bind="$attrs"
		:on="$listeners"
	/>
</template>
