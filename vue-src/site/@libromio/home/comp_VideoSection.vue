<script>
export default {
	name: 'VideoSection',
	computed: {
		isMobile() {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					return 200
				case 'sm':
					return 400
				default:
					return 600
			}
		},
	},
}
</script>

<template>
	<Container class="pa-0 mb-16">
		<v-row>
			<v-col cols="12">
				<iframe
					src="https://www.youtube.com/embed/QTvwiFBV94A?controls=0"
					width="100%"
					:height="isMobile"
					title="YouTube video player"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</v-col>
		</v-row>
	</Container>
</template>

<style scoped></style>
