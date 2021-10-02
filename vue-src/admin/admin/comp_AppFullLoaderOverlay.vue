<script>
export default {
	name: 'FullLoaderOverlay',
	props: {
		visible: Boolean,
		title: String,
		text: String,
	},
	computed: {
		titleText() {
			return this.title || 'Panel Administrador'
		},
		messageText() {
			return this.text || 'Aguarde un momento...'
		},
	},
}
</script>

<template>
	<v-overlay
		:value="visible"
		color="primary"
		dark
		opacity="1"
		z-index="999"
		class="text-center"
		:style="{ position: 'fixed' }"
	>
		<v-progress-circular
			indeterminate
			color="white"
			size="80"
			width="8"
			class="my-4"
		/>
		<div class="text-h4 font-weight-light">
			{{ titleText }}
		</div>
		<div class="text-subtitle-1 font-weight-thin mt-2">
			{{ messageText }}
		</div>
	</v-overlay>
</template>

<style scoped>
.v-overlay--active {
	transition: none;
}
</style>
