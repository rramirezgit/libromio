<script>
import { VSwitch } from 'vuetify/lib'

export default {
	name: 'DynamicField',
	components: { VSwitch },
	props: {
		model: {},
		componentName: String,
		fieldType: String,
		label: String,
		componentAttrs: Object,
		validatorKey: String,
	},
	model: {
		prop: 'model',
		event: 'updateModel',
	},
	data() {
		return {
			internalModel: null,
		}
	},
	watch: {
		internalModel(value) {
			this.$emit('updateModel', value)
		},
	},
	computed: {
		componentsByType() {
			return {
				string: { name: 'TextField' },
				text: { name: 'Textarea' },
				multiString: {
					name: 'Combobox',
					attrs: {
						multiple: true,
						smallChips: true,
						delimiters: [' '],
					},
				},
				color: { name: 'ColorPickerDialog' },
				number: { name: 'TextField', attrs: { type: 'number' } },
				boolean: {
					name: 'VSwitch',
					attrs: { inset: true, color: 'primary' },
				},
				date: { name: 'DatePickerDialog', attrs: { inset: true } },
				select: { name: 'Select' },
			}
		},
		component() {
			let component = null
			if (this.componentName) {
				component = { name: this.componentName }
			} else if (this.fieldType) {
				component = this.componentsByType[this.fieldType]
			}
			if (!component) return null
			if (!component.attrs) component.attrs = {}
			Object.assign(component.attrs, this.componentAttrs || {})
			return component
		},
	},
	created() {
		this.internalModel = this.model
	},
}
</script>
<template>
	<component
		v-if="component"
		v-model="internalModel"
		v-bind="{ ...component.attrs, ...$attrs }"
		:is="component.name"
		:label="label"
		:validator-key="validatorKey"
	/>
</template>
