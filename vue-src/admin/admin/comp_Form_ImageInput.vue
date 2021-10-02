<script>
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'ImageInput',
	mixins: [inputMixin],
	props: {
		initialSrc: String,
		editable: Boolean,
		movable: Boolean,
		clearable: Boolean,
		multiple: Boolean,
		fileModel: File,
		label: String,
		requirements: [Array, String],
		wider: Boolean,
		taller: Boolean,
		size: {
			type: [Number, String],
			default: 220,
		},
	},
	model: {
		prop: 'fileModel',
		event: 'fileChanged',
	},
	data() {
		return {
			loadedImageSrc: null,
		}
	},
	created() {
		this.onFileChanged(this.fileModel)
	},
	computed: {
		showOverlay() {
			return this.canUpload || this.clearable || this.movable
		},
		canUpload() {
			return !this.hasInitialImage || this.editable
		},
		imageSrc() {
			return this.loadedImageSrc || this.initialSrc
		},
		hasImage() {
			return !!this.imageSrc
		},
		hasInitialImage() {
			return !!this.initialSrc
		},
		uploadButtonText() {
			if (this.multiple) {
				return this.hasImage ? 'Cambiar imágenes' : 'Subir imágenes'
			} else {
				return this.hasImage ? 'Cambiar imagen' : 'Subir imagen'
			}
		},
		requirementsStrs() {
			if (!this.requirements) return []
			return Array.isArray(this.requirements) ? this.requirements : [this.requirements]
		},
		cSize() {
			return Math.max(220, this.size)
		},
		width() {
			if (this.wider) return parseInt(this.cSize) * 2
			else return this.cSize
		},
		height() {
			if (this.taller && !this.wider) return parseInt(this.cSize) * 2
			else return this.cSize
		},
	},
	watch: {
		fileModel() {
			if (!this.fileModel) {
				this.onFileChanged(null)
			}
		},
	},
	methods: {
		chooseImage() {
			this.$refs.fileInput.click()
		},
		clear() {
			this.onFileChanged(null)
			this.$emit('cleaned')
		},
		fileInputHandler() {
			const input = this.$refs.fileInput
			const files = input.files
			if (files && files[0]) {
				let file = this.multiple ? files : files[0]
				this.onFileChanged(file)
			}
			input.value = ''
		},
		onFileChanged(file) {
			if (!file || this.multiple) {
				this.loadedImageSrc = null
				this.setValidation(null)
			} else {
				const reader = new FileReader()
				reader.onload = (e) => {
					this.loadedImageSrc = e.target.result
				}
				reader.readAsDataURL(file)
			}

			this.$emit('fileChanged', file)
			this.$emit('changed', file)
		},
		move(by) {
			this.$emit('moved', by)
		},
	},
}
</script>

<template>
	<div>
		<div v-if="label" class="text-subtitle-1">
			{{ label }}
		</div>
		<v-hover v-slot="{ hover }">
			<div
				class="d-flex align-center justify-center image-input"
				:class="{ 'has-error': hasError }"
				:style="{
					width: `${width}px`,
					height: `${height}px`,
					position: 'relative',
				}"
			>
				<img :src="imageSrc" class="image-input__img" />
				<v-overlay absolute :value="hasImage ? hover : true" v-if="showOverlay" opacity=".8">
					<Button color="primary" @click="chooseImage" v-if="canUpload">
						<v-icon class="mr-1">mdi-image</v-icon>
						{{ uploadButtonText }}
					</Button>
					<div class="text-center mt-1" v-for="(str, i) of requirementsStrs" :key="i">
						{{ str }}
					</div>
				</v-overlay>

				<div class="top-btns-container" v-show="hasImage ? hover : true">
					<Button color="white" text @click="move(-1)" v-if="movable">
						<v-icon>mdi-chevron-left</v-icon>
					</Button>
					<Button color="white" text @click="move(1)" v-if="movable">
						<v-icon>mdi-chevron-right</v-icon>
					</Button>
					<v-spacer />
					<Button color="white" text @click="clear" v-if="clearable && hasImage">
						<v-icon>mdi-delete</v-icon>
					</Button>
				</div>

				<input
					class="d-none"
					ref="fileInput"
					type="file"
					:multiple="multiple"
					@input="fileInputHandler"
				/>
			</div>
		</v-hover>
		<div class="error--text text-caption px-1" v-for="err of validationErrors" :key="err">
			{{ err }}
		</div>
	</div>
</template>

<style scoped>
.image-input {
	border: 1px solid #ccc;
	border-radius: 8px;
	overflow: hidden;
	position: relative;
}
.image-input__img {
	max-width: 100%;
	max-height: 100%;
}
.image-input.has-error {
	border: 2px solid var(--v-error-base);
	border-radius: 4px;
	overflow: hidden;
}
.top-btns-container {
	display: flex;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 5;
}
</style>
