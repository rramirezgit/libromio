<script>
export default {
	name: 'Home',
	data() {
		return {
			threeBox: this.$srv('HomeBoxesThree'),
			fourthBox: this.$srv('HomeBoxesFourth'),
			featured1: this.$srv('HomeFeatured1'),
			featured2: this.$srv('HomeFeatured2'),
		}
	},
}
</script>

<template>
	<div>
		<MainCarousel />
		<ProductCardsSection
			v-if="featured1"
			:products="featured1.products"
			:title="featured1.title"
			:ctaTxt="featured1.ctaTxt"
			:link="featured1.link"
		/>
		<ImageThreeBoxesSection
			:topText="threeBox.titleText"
			:imageFirst="threeBox.imgFirst"
			:ctaFirstBoxColor="threeBox.ctaColorFirstBox"
			:ctaFirstBoxText="threeBox.ctaTextFirstBox"
			:LinkFirstBox="threeBox.LinkFirstBox"
			:imageSecond="threeBox.imgSecond"
			:ctaSecondBoxColor="threeBox.ctaColorSecondBox"
			:ctaSecondBoxText="threeBox.ctaTextSecondBox"
			:LinkSecondBox="threeBox.LinkSecondBox"
			:imageThird="threeBox.imgThird"
			:ctaThirdBoxColor="threeBox.ctaColorThirdBox"
			:ctaThirdBoxText="threeBox.ctaTextThirdBox"
			:LinkThirdBox="threeBox.LinkThirdBox"
		/>
		<CarouselBSection />
		<ProductsCarouselSection v-if="featured2" :products="featured2.products" />
		<ImageFourthBoxesSection
			v-if="fourthBox"
			:topText="fourthBox.titleText"
			:imageFirst="fourthBox.imgFirst"
			:ctaFirstBoxText="fourthBox.ctaTextFirstBox"
			:LinkFirstBox="fourthBox.LinkFirstBox"
			:imageSecond="fourthBox.imgSecond"
			:ctaSecondBoxText="fourthBox.ctaTextSecondBox"
			:LinkSecondBox="fourthBox.LinkSecondBox"
			:imageThird="fourthBox.imgThird"
			:ctaThirdBoxText="fourthBox.ctaTextThirdBox"
			:LinkThirdBox="fourthBox.LinkThirdBox"
			:imageFourth="fourthBox.imgFourth"
			:ctaFourthBoxText="fourthBox.ctaTextFourthBox"
			:LinkFourthBox="fourthBox.LinkFourthBox"
		/>
		<VideoSection />
		<CarouselCSection />
		<NewsletterSection />
		<Container>
			<v-row class="mt-8 mb-8">
				<v-col col="12" class="d-flex justify-center align-center">
					<div class="font-3 primary--text font-weight-bold">
						Seguinos en nuestras redes
					</div>
					<v-btn fab dark small elevation="0" color="primary" class="ml-2">
						<v-icon class="mr-0">mdi-facebook</v-icon>
					</v-btn>
					<v-btn fab dark small elevation="0" color="primary" class="ml-2">
						<v-icon class="mr-0">mdi-instagram</v-icon>
					</v-btn>
				</v-col>
			</v-row>
		</Container>
		<ImageBoxesCSection />
		<FrequentlyAsked />

		X
	</div>
</template>
