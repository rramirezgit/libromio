import { cloneDeep } from 'lodash'

export default (_itemKey) => ({
	props: {
		itemModel: Object,
	},
	model: {
		prop: 'itemModel',
		event: 'updateModel',
	},
	data() {
		return {
			[_itemKey]: {},
			dialog: false,
			loading: false,
			loadingDelete: false,
			validation: {},
		}
	},
	computed: {
		hasItem() {
			return !!this.itemModel
		},
		isNew() {
			return this.itemModel && !this.itemModel.id
		},
	},
	watch: {
		itemModel(value) {
			if (value) {
				this.dialog = true
				this.validation = {}
				this[_itemKey] = cloneDeep(value)
			}
		},
		dialog(value) {
			if (!value) {
				setTimeout(() => {
					this.validation = {}
					this.$emit('updateModel', null)
				}, 500)
			}
		},
	},
})
