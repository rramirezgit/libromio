<script>
export default {
	name: 'ItemDialog',
	props: {
		dialog: Boolean,
		titleText: String,
		submitText: String,
		loading: Boolean,
		loadingDelete: Boolean,
		deletable: Boolean,
		maxWidth: String,
		submitColor: String,
		noActions: Boolean,
	},
	model: {
		prop: 'dialog',
		event: 'updateModel',
	},
	data() {
		return {
			dialogKey: 0,
			closing: false,
		}
	},
	watch: {
		dialog(value) {
			if (value) {
				this.dialogKey += 1
				this.$emit('openDialog')
			} else {
				this.closing = true
				setTimeout(() => (this.closing = false), 500)
			}
		},
	},
	methods: {
		closeDialog() {
			this.$emit('updateModel', false)
		},
	},
}
</script>

<template>
	<v-dialog
		:key="dialogKey"
		:value="dialog"
		:max-width="maxWidth || '700px'"
		class="pb-6"
		persistent
		scrollable
		v-bind="$attrs"
	>
		<v-card>
			<v-card-title>
				<slot name="header" v-bind="{ closeDialog }">
					<span class="headline">{{ titleText }}</span>
				</slot>
			</v-card-title>
			<v-card-text style="max-height: 1000px">
				<slot></slot>
			</v-card-text>
			<v-card-actions v-if="!noActions">
				<slot name="actions" v-bind="{ closeDialog }">
					<v-btn
						color="error"
						@click="$emit('delete')"
						v-if="deletable"
						:loading="loadingDelete"
						:disabled="loading || closing"
					>
						<v-icon>mdi-delete</v-icon>
						Eliminar
					</v-btn>
					<v-spacer></v-spacer>
					<v-btn text @click="closeDialog" :disabled="loading || loadingDelete || closing">
						Cancelar
					</v-btn>
					<v-btn
						:color="submitColor || 'success'"
						:loading="loading"
						@click="$emit('submit')"
						:disabled="loadingDelete || closing"
					>
						{{ submitText || titleText }}
					</v-btn>
				</slot>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
