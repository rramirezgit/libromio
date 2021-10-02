<script>
export default {
	name: 'Container',
}
</script>

<template>
	<v-container v-bind="$attrs">
		<slot></slot>
	</v-container>
</template>

<style>
.container {
	width: 1181px;
	max-width: 90%;
}
.container.container--fluid {
	width: 100%;
	max-width: 100%;
}
</style>
