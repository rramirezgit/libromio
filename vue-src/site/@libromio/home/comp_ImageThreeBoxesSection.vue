<script>
export default {
	name: 'ImageThreeBoxesSection',
	props: {
		topText: String,
		imageFirst: String,
		ctaFirstBoxColor: String,
		ctaFirstBoxText: String,
		LinkFirstBox: String,
		imageSecond: String,
		ctaSecondBoxColor: String,
		ctaSecondBoxText: String,
		LinkSecondBox: String,
		imageThird: String,
		ctaThirdBoxColor: String,
		ctaThirdBoxText: String,
		LinkThirdBox: String,
	},
}
</script>

<template>
	<Container class="pa-0 pt-16 pb-16">
		<v-row>
			<v-col cols="12" v-if="topText" class="d-flex justify-center">
				<div class="top-text text-center primary--text font-6 font-weight-bold">
					{{ topText }}
				</div>
			</v-col>
			<v-col cols="12" sm="4">
				<ImageCard
					:image="imageFirst"
					:ratio="1.03"
					:cta-txt="ctaFirstBoxText"
					:cta-link="LinkFirstBox"
					:cta-color="ctaFirstBoxColor"
				/>
			</v-col>
			<v-col cols="12" sm="4">
				<ImageCard
					:image="imageSecond"
					:ratio="1.03"
					:cta-txt="ctaSecondBoxText"
					:cta-link="LinkSecondBox"
					:cta-color="ctaSecondBoxColor"
				/>
			</v-col>
			<v-col cols="12" sm="4">
				<ImageCard
					:image="imageThird"
					:ratio="1.03"
					:cta-txt="ctaThirdBoxText"
					:cta-link="LinkThirdBox"
					:cta-color="ctaThirdBoxColor"
				/>
			</v-col>
		</v-row>
	</Container>
</template>

<style scoped>
.top-text {
	max-width: 550px;
	width: 100%;
}
</style>
