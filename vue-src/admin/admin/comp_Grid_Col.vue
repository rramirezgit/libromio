<script>
export default {
	name: 'c',
	props: {
		cols: {
			type: String,
		},
		xs: {
			type: String,
			default: '12',
		},
	},
}
</script>

<template>
	<v-col v-bind="$attrs" :cols="cols || xs">
		<slot></slot>
	</v-col>
</template>
