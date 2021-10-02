<script>
export default {
	name: 'CardLayout',
	props: {
		title: String,
		showIcon: {
			type: Boolean,
			default: true,
		},
		clickable: Boolean,
		linkText: String,
	},
	methods: {
		linkClick() {
			this.$emit('linkClick')
		},
		cardClick() {
			this.$refs.card.$el.blur()
			this.$emit('cardClick')
		},
	},
}
</script>

<template>
	<v-card
		v-on="clickable ? { click: cardClick } : {}"
		tile
		class="mb-4 pa-5"
		ref="card"
		style="border-left: 4px solid currentColor"
	>
		<v-card-title v-if="title || $slots.title" class="pa-0 pl-sm-5 pr-sm-5 mb-4">
			<slot name="title">
				<div class="text-h6 primary--text">
					{{ title }}
				</div>
				<v-spacer />
				<v-btn v-if="linkText" @click.prevent.stop="linkClick" color="link" text small>
					{{ linkText }}
				</v-btn>
			</slot>
		</v-card-title>
		<v-divider v-if="title || $slots.title" class="mb-4" />
		<v-card-actions :class="{ 'd-block': !clickable }" class="nowrap pl-sm-5 pr-sm-5">
			<div>
				<slot></slot>
			</div>
			<v-spacer v-if="clickable" />
			<v-icon v-if="clickable" color="primary" right x-large>
				mdi-chevron-right-circle
			</v-icon>
		</v-card-actions>
	</v-card>
</template>

<style scoped>
.nowrap {
	flex-wrap: nowrap;
}
</style>
