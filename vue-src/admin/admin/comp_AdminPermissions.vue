<script>
export default {
	name: 'AdminPermissions',
	props: {
		permissions: Array,
	},
	data: () => ({
		selectedPermissions: [],
		relations: {},
	}),
	watch: {
		permissions() {
			this.assignPermissions()
		},
		selectedPermissions() {
			this.clearInputs()
			for (let item of this.selectedPermissions) {
				this.updateValues(item)
			}
			this.$emit('updatedPermission', this.selectedPermissions)
		},
	},
	methods: {
		async loadData() {
			await this.$adminApi.get({
				url: '/admin/permissions',
				loading: (v) => (this.loading = v),
				cache: true,
				onSuccess: ({ data }) => {
					data.permissions.sort((a, b) => {
						if (a.children.includes(b.key)) {
							return -1
						}
						if (b.children.includes(a.key)) {
							return 1
						}
						return 0
					})
					this.relations = {}
					for (let item of data.permissions) {
						this.relations[item.key] = item
					}
					this.assignPermissions()
				},
			})
		},
		updateValues(item) {
			this.relations[item].children.map((relatedItem) => {
				this.removeSelectedChildren(relatedItem)
				this.relations[relatedItem].inds = true
				this.updateValues(relatedItem)
			})
		},
		removeSelectedChildren(relatedItem) {
			let valueIndex = this.selectedPermissions.indexOf(relatedItem)
			valueIndex != -1 && this.selectedPermissions.splice(valueIndex, 1)
		},
		assignPermissions() {
			if (this.permissions) {
				this.selectedPermissions = this.permissions.map((item) => item.key)
			} else {
				this.selectedPermissions = []
			}
		},
		clearInputs() {
			for (let item in this.relations) {
				this.relations[item].inds = false
			}
		},
	},
	mounted() {
		this.assignPermissions()
	},
	created() {
		this.loadData()
	},
}
</script>

<template>
	<div>
		<v-checkbox
			v-for="item in relations"
			:key="item.key"
			v-model="selectedPermissions"
			:label="item.name"
			:value="item.key"
			:indeterminate="relations[item.key].inds"
			:disabled="relations[item.key].inds"
			hide-details
		/>
	</div>
</template>
