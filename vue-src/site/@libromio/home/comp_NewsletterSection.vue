<script>
export default {
	name: 'NewsletterSection',
}
</script>

<template>
	<Container fluid class="primary-red">
		<Container class="pa-0 pt-16 pb-16">
			<v-row class="text-center">
				<v-col cols="12" class="text-left black--text d-flex justify-center">
					<div class="font-6 pb-5 white--text font-weight-bold text-center text-sm-left max-width-text">
						Enterate de todas las novedades y recibí promociones especiales
					</div>
				</v-col>
				<v-col cols="12">
					<NewsLetterForm />
				</v-col>
			</v-row>
		</Container>
	</Container>
</template>

<style scoped>
/deep/ .v-text-field {
	font-family: 'Playfair Display';
}

.max-width-text {
	max-width: 500px;
	width: 100%;
}
</style>
