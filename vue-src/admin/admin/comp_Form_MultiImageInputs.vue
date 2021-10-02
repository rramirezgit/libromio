<script>
export default {
	name: 'MultiImageInputs',
	props: {
		imagesModel: Array,
		srcProp: {
			type: String,
			default: 'src',
		},
	},
	model: {
		prop: 'imagesModel',
		event: 'imagesChanged',
	},
	data() {
		return {
			images: this.imagesModel || [],
			keys: 0,
		}
	},
	methods: {
		onMoved(image, by) {
			image.pos += 1.5 * by
			this.updateImages()
		},
		onCleaned(image) {
			image.__deleted = true
			this.updateImages()
		},
		onNewUploads(files) {
			if (!files) return
			for (let file of files) {
				let pos = this.images.length
				this.images.push({
					__key: this.keys++,
					__new: true,
					file,
					pos,
				})
			}
			this.updateImages()
		},
		updateImages() {
			this.images = this.images
				.filter((image) => !!image.file || !image.__new)
				.filter((image) => !image.__deleted)
				.sort((a, b) => a.pos - b.pos)
				.map((image, i) => {
					image.pos = i
					return image
				})
			this.$emit('imagesChanged', this.images)
		},
	},
	created() {
		this.images.forEach((img) => (img.__key = this.keys++))
		this.updateImages()
	},
}
</script>

<template>
	<div class="d-flex flex-wrap">
		<ImageInput
			class="mr-4 mb-4 img-block"
			v-for="image of images"
			:key="image.__key"
			:initial-src="image[srcProp]"
			:movable="images.length > 1"
			:editable="image.__new"
			clearable
			v-model="image.file"
			:validator-key="`image_${image.pos}.file`"
			@moved="onMoved(image, $event)"
			@changed="updateImages"
			@cleaned="onCleaned(image)"
		/>
		<ImageInput
			class="mr-4 mb-4 img-block"
			multiple
			@changed="onNewUploads($event)"
		/>
	</div>
</template>

<style scoped>
.img-block {
	flex: 0 1 220px;
}
</style>
