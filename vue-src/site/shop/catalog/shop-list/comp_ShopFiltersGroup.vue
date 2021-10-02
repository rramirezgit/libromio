<script>
export default {
	name: 'ShopFiltersGroup',
	props: {
		title: String,
		items: Array,
	},
	data() {
		return {}
	},
	computed: {
		validatedItems() {
			return (this.items || []).filter((item) => {
				return item.count === undefined || item.count > 0
			})
		},
	},
	methods: {
		updateFilters() {
			this.$emit('updateFilters')
		},
	},
}
</script>

<template>
	<div class="mt-6" v-if="validatedItems.length">
		<div class="text-h6 font-weight-bold text-uppercase" v-if="title">
			{{ title }}
		</div>
		<div>
			<div v-for="(item, i) of validatedItems" :key="i" class="pa-0">
				<v-btn
					class="font-weight-bold font-subtitle-2 text-uppercase"
					:plain="!item.color"
					small
					:left="!item.color"
					:text="!item.color"
					:ripple="!!item.color"
					:class="{ 'primary--text pl-0': !item.color }"
					:style="{ backgroundColor: item.color }"
					:dark="!!item.color"
					@click="$emit('filterClick', item)"
				>
					{{ item.text }}
					<span class="ml-1" v-if="item.count" style="opacity: .9">
						({{ item.count }})
					</span>
				</v-btn>
			</div>
		</div>
	</div>
</template>
