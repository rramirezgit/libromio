<script>
export default {
	name: 'ProductCardImage',
	props: {
		mainImage: String,
		secondImage: String,
	},
	data() {
		return {
			firstHover: false,
		}
	},
}
</script>

<template>
	<v-hover v-slot="{ hover }">
		<div class="parent-container" @mouseover="firstHover = true">
			<v-img
				width="100%"
				height="auto"
				contain
				class="white--text grey lighten-3"
				aspect-ratio="1"
				:src="mainImage"
			>
				<template #placeholder>
					<v-row class="fill-height ma-0" align="center" justify="center">
						<v-progress-circular indeterminate color="grey lighten-5" />
					</v-row>
				</template>
			</v-img>
			<div class="child-container" v-if="secondImage && firstHover">
				<v-img
					width="100%"
					height="auto"
					contain
					class="white--text second-image"
					:class="{ 'second-image--show': hover }"
					aspect-ratio="1"
					:src="secondImage"
				>
					<template #placeholder>
						<v-row class="fill-height ma-0" align="center" justify="center">
							<v-progress-circular indeterminate color="grey lighten-5" />
						</v-row>
					</template>
				</v-img>
			</div>
		</div>
	</v-hover>
</template>

<style scoped>
.parent-container {
	position: relative;
}
.child-container {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}
.second-image {
	transition: opacity 0.3s;
	opacity: 0;
}
.second-image--show {
	opacity: 1;
}
</style>
