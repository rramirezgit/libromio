<script>
export default {
	name: 'TabsItems',
}
</script>

<template>
	<v-tabs-items v-bind="$attrs" class="pa-3 pa-md-6 elevation-4">
		<slot></slot>
	</v-tabs-items>
</template>
