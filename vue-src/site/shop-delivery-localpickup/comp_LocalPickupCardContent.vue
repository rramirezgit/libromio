<script>
export default {
	name: 'LocalPickupCardContent',
	props: {
		data: Object,
		extended: Boolean,
	},
	computed: {
		title() {
			return this.data.title
		},
		subtitle() {
			return this.extended ? this.data.fullAddressLine : this.data.addressLine
		},
		items() {
			let items = [
				{ icon: 'mdi-clock', text: this.data.businessHours },
				{ icon: 'mdi-check', text: this.data.availability },
				{ icon: 'mdi-currency-usd-off', text: this.data.costMsg },
			]
			if (this.extended) {
				items.push({ icon: 'mdi-alert-circle-outline', text: this.data.extraMsg })
			}
			return items
		},
	},
}
</script>

<template>
	<div>
		<div class="font-weight-bold primary--text">
			{{ title }}
		</div>
		<div v-if="subtitle">
			{{ subtitle }}
		</div>
		<v-list v-if="items">
			<v-list-item v-for="(item, j) of items" :key="j" dense>
				<v-list-item-icon class="mr-0">
					<v-icon small>{{ item.icon }}</v-icon>
				</v-list-item-icon>
				<v-list-item-content>{{ item.text }}</v-list-item-content>
			</v-list-item>
		</v-list>
	</div>
</template>
