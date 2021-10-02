<script>
export default {
	props: {
		descriptionTxt: String,
	},
	data() {
		return {
			showFull: false,
		}
	},
	computed: {
		showDescription() {
			return this.showFull ? this.descriptionTxt : this.descriptionTxt.substring(0, 853)
		},
		showBtn() {
			return this.descriptionTxt.length > 853
		},
		btnTxt() {
			return this.showFull ? 'Cerrar' : 'Leer Más'
		},
	},
	methods: {
		toggleDescription() {
			this.showFull = !this.showFull
		},
	},
}
</script>

<template>
	<div class="mt-5 show-line-breaks">
		{{ showDescription }}<span v-if="showBtn && !this.showFull">...</span>
		<div v-if="showBtn" class="d-flex justify-end">
			<v-btn @click="toggleDescription" text plain :ripple="false">
				{{ btnTxt }}
			</v-btn>
		</div>
	</div>
</template>

<style scoped>
.show-line-breaks {
	white-space: pre-line;
}
</style>
