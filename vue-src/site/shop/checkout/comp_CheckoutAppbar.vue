<script>
export default {
	name: 'CheckoutAppbar',
	methods: {
		btnClick() {
			this.$router.push({ name: 'home' })
		},
	},
	computed: {
		/*appBarHeight() {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					return 70
				default:
					return 70
			}
		},*/
	},
}
</script>

<template>
	<div class="white">
		<Container class="d-flex align-center pa-0">
			<img
				:alt="$srv('BusinessInfo.name')"
				class="shrink mr-2 pt-4 pb-4"
				:src="$srv('SiteLogo.logo')"
				width="140"
				style="width: 140px; height: auto;"
			/>
			<v-spacer />
			<v-btn text color="link" small @click="btnClick">
				Seguir<br v-if="$vuetify.breakpoint.xs" />
				Comprando
			</v-btn>
		</Container>
	</div>
</template>
