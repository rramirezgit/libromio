<script>
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'DatePickerDialog',
	mixins: [inputMixin],
	props: {
		dialogProps: {
			type: Object,
			default: () => {},
		},
		pickerProps: {
			type: Object,
			default: () => {},
		},
		dateModel: String,
		placeholder: {
			type: String,
			default: 'AAAA-MM-DD',
		},
	},
	model: {
		prop: 'dateModel',
		event: 'changed',
	},
	data() {
		return {
			dialog: false,
			pickerDate: null,
			icon: null,
		}
	},
	methods: {
		onPickerAccept() {
			this.$emit('changed', this.pickerDate)
			this.dialog = false
		},
		onPickerCleanup() {
			this.$emit('changed', null)
			this.dialog = false
		},
		focus() {
			this.$refs.textField.focus()
		},
	},
	watch: {
		dialog(value) {
			if (value) {
				this.pickerDate = this.dateModel
			}
		},
	},
}
</script>

<template>
	<v-dialog v-model="dialog" persistent width="290px" v-bind="dialogProps">
		<template v-slot:activator="{ on, attrs }">
			<TextField
				ref="textField"
				:value="dateModel"
				:placeholder="placeholder"
				append-icon="mdi-calendar"
				@click:append="dialog = true"
				readonly
				v-bind="{ ...attrs, ...$attrs }"
				v-on="{ ...on, ...$listeners }"
				:error-messages="validationErrors"
			/>
		</template>
		<v-date-picker v-model="pickerDate" scrollable v-bind="pickerProps" locale="es-es">
			<v-spacer></v-spacer>
			<Button text @click="onPickerCleanup">
				Borrar
			</Button>
			<Button text color="primary" @click="onPickerAccept">
				OK
			</Button>
		</v-date-picker>
	</v-dialog>
</template>
