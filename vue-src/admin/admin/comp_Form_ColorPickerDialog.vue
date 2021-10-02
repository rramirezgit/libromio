<script>
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'ColorPickerDialog',
	mixins: [inputMixin],
	inject: ['showDialog'],
	props: {
		model: String,
		pickerProps: Object,
		dialogTitle: {
			type: String,
			default: 'Selecciona un color',
		},
	},
	model: {
		prop: 'model',
		event: 'updateModel',
	},
	data() {
		return {
			dialog: false,
			pickerColor: null,
			pickerDialog: false,
			icon: null,
			colorText: this.model,
		}
	},
	watch: {
		pickerDialog(value) {
			if (value) {
				this.pickerColor = this.colorText
			}
		},
		colorText(value) {
			this.$emit('updateModel', value)
		},
	},
	methods: {
		onDialogAcceptep() {
			this.colorText = this.pickerColor.hex || this.pickerColor
		},
		focus() {
			this.$refs.textField.focus()
		},
	},
}
</script>

<template>
	<div>
		<TextField
			ref="textField"
			v-model="colorText"
			placeholder="#FFFFFF"
			@click="pickerDialog = true"
			readonly
			v-bind="$attrs"
			:error-messages="validationErrors"
			clearable
			class="color-picker-text-field"
		>
			<template #append>
				<div
					class="color-circle"
					:style="{ backgroundColor: colorText }"
					v-if="colorText"
					@click="pickerDialog = true"
				></div>
				<v-icon v-else @click="pickerDialog = true">mdi-palette</v-icon>
			</template>
		</TextField>
		<AppMessageDialog
			:title="dialogTitle"
			v-model="pickerDialog"
			@accepted="onDialogAcceptep"
			actions-right
			max-width="400"
		>
			<div class="d-flex justify-center">
				<v-color-picker
					v-model="pickerColor"
					v-bind="pickerProps"
					show-swatches
					swatches-max-height="120"
				/>
			</div>
		</AppMessageDialog>
	</div>
</template>

<style scoped>
.color-picker-text-field >>> * {
	cursor: pointer;
}
.color-circle {
	height: 24px;
	width: 24px;
	border-radius: 100%;
	border: 1px dotted #999;
}
</style>
