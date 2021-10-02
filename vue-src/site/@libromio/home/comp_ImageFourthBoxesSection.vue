<script>
export default {
	name: 'ImageFourthBoxesSection',
	props: {
		topText: String,
		imageFirst: String,
		ctaFirstBoxText: String,
		LinkFirstBox: String,
		imageSecond: String,
		ctaSecondBoxText: String,
		LinkSecondBox: String,
		imageThird: String,
		ctaThirdBoxText: String,
		LinkThirdBox: String,
		imageFourth: String,
		ctaFourthBoxText: String,
		LinkFourthBox: String,
	},
}
</script>

<template>
	<Container class="pa-0">
		<v-row class="pt-16 pb-16">
			<v-col cols="12" v-if="topText">
				<div class="text-center primary--text font-6 font-weight-bold">
					{{ topText }}
				</div>
			</v-col>
			<v-col cols="12" sm="6" md="3">
				<ImageCard :image="imageFirst" :ratio="0.8" :cta-txt="ctaFirstBoxText" :cta-link="LinkFirstBox" />
			</v-col>
			<v-col cols="12" sm="6" md="3">
				<ImageCard
					:image="imageSecond"
					:ratio="0.8"
					:cta-txt="ctaSecondBoxText"
					:cta-link="LinkSecondBox"
				/>
			</v-col>
			<v-col cols="12" sm="6" md="3">
				<ImageCard :image="imageThird" :ratio="0.8" :cta-txt="ctaThirdBoxText" :cta-link="LinkThirdBox" />
			</v-col>
			<v-col cols="12" sm="6" md="3">
				<ImageCard
					:image="imageFourth"
					:ratio="0.8"
					:cta-txt="ctaFourthBoxText"
					:cta-link="LinkFourthBox"
				/>
			</v-col>
		</v-row>
	</Container>
</template>
