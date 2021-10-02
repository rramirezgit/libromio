<script>
export default {
	name: 'ImageBoxesCSection',
	data() {
		return {
			boxLarge: this.$srv('HomeFiveBoxes').img,
			boxSmall1: this.$srv('HomeFiveBoxes').imgFirst,
			boxSmall2: this.$srv('HomeFiveBoxes').imgSecond,
			boxSmall3: this.$srv('HomeFiveBoxes').imgThird,
			boxSmall4: this.$srv('HomeFiveBoxes').imgFourth,
			bien: this.$srv('HomeFiveBoxes'),
		}
	},
	computed: {
		isMobile() {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					return true
				default:
					return false
			}
		},
	},
}
</script>

<template>
	<Container class=" pa-0">
		<v-row class="pa-0">
			<v-col cols="12" class="d-flex" :class="isMobile && 'flex-column flex-sm-row'">
				<div class="large-box-parent" :class="isMobile ? 'large-box-parent-sm' : 'pa-3 pt-0'">
					<v-img :src="boxLarge" ratio="1" width="100%"> </v-img>
				</div>
				<div :class="!isMobile ? 'small-boxes-parent' : 'small-boxes-sm-parent'">
					<div class="d-flex">
						<div class="each-image-parent pa-0 pa-sm-2 pt-2 pt-sm-0 pr-1">
							<v-img width="100%" ratio="1.15" :src="boxSmall1"></v-img>
						</div>
						<div class="each-image-parent pa-0 pa-sm-2 pt-2 pt-sm-0 pl-1 ">
							<v-img width="100%" ratio="1.15" :src="boxSmall2"></v-img>
						</div>
					</div>
					<div class="d-flex ">
						<div class="each-image-parent pa-0 pa-sm-2 pt-2 pr-1">
							<v-img width="100%" ratio="1.15" :src="boxSmall3"></v-img>
						</div>
						<div class="each-image-parent pa-0 pa-sm-2 pt-2 pl-1 ">
							<v-img width="100%" ratio="1.15" :src="boxSmall4"></v-img>
						</div>
					</div>
				</div>
			</v-col>
		</v-row>
	</Container>
</template>

<style scoped>
.large-box-parent {
	width: 46.8%;
}

.small-boxes-parent {
	width: 53.2%;
}

.small-boxes-sm-parent {
	width: 100%;
}

.each-image-parent {
	width: 50%;
}

.img-small {
	width: 50%;
}

.large-box-parent-sm {
	width: 100%;
}
</style>
