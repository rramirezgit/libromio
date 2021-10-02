<script>
export default {
	name: 'SkuChip',
	props: {
		sku: String,
	},
}
</script>

<template>
	<div class="d-inline-block grey lighten-4 grey--text text--darken-2 rounded font-weight-bold px-2">
		<small>SKU {{ sku }}</small>
	</div>
</template>
