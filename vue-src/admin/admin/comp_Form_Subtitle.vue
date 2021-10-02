<script>
export default {
	name: 'Subtitle',
	props: {
		icon: {
			type: String,
			default: 'mdi-chevron-right',
		},
		text: String,
	},
}
</script>

<template>
	<div>
		<div class="d-flex align-center text-overline">
			<v-icon class="mr-1">{{ icon }}</v-icon>
			<span>
				{{ text }}
			</span>
		</div>
		<div class="cool-underline"></div>
	</div>
</template>

<style scoped>
span {
	line-height: 1.4;
}
.cool-underline {
	margin-top: 4px;
	height: 5px;
	width: 60px;
	background: #666;
}
</style>
