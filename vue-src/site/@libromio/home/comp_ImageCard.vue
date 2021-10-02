<script>
export default {
	name: 'ImageCard',
	props: {
		image: String,
		ctaTxt: String,
		ctaLink: String,
		ratio: Number,
		imgWidth: Number,
		btnClass: String,
		ctaColor: String,
	},
	computed: {
		getCtaColor() {
			return !this.ctaColor ? 'primary' : this.ctaColor
		},
	},
}
</script>

<template>
	<v-card :to="ctaLink" height="100%" width="100%" flat tile class="d-flex align-content-end ">
		<v-img :width="imgWidth" :src="image" :aspect-ratio="ratio">
			<div class="alignContentBottom">
				<v-card-text class="white--text pb-6">
					<div class="text-center">
						<v-btn
							v-if="ctaTxt"
							rounded
							elevation="0"
							large
							class="white--text font-weight-bold pl-lg-13 pr-lg-13 pt-lg-8 pb-lg-8"
							:color="getCtaColor"
						>
							{{ ctaTxt }}
						</v-btn>
					</div>
				</v-card-text>
			</div>
		</v-img>
	</v-card>
</template>

<style scoped>
.alignContentBottom {
	height: 100%;
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
}
</style>
