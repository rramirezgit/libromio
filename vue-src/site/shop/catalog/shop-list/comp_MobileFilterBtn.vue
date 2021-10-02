<script>
export default {
	name: 'MobileFilterBtn',
	methods: {
		toggleDrawer() {
			this.$emit('toggleDrawer')
		},
	},
}
</script>

<template>
	<div>
		<v-bottom-navigation grow fixed>
			<v-btn @click="toggleDrawer" class="ml-0 pl-0" text plain :ripple="false">
				<v-icon>
					mdi-filter
				</v-icon>
				FILTRAR/ORDENAR
			</v-btn>
		</v-bottom-navigation>
	</div>
</template>
