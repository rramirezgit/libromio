<script>
export default {
	name: 'AppMessageDialog',
	props: {
		visible: Boolean,
		type: String,
		title: String,
		text: String,
		code: Number,
		description: String,
		accept: String,
		cancel: String,
		maxHeight: [String, Number],
		maxWidth: {
			type: [String, Number],
			default: 650,
		},
		maxContentHeight: {
			type: [String, Number],
			default: 650,
		},
		actionsRight: Boolean,
	},
	computed: {
		titleText() {
			if (this.title) return this.title
			if (this.type == 'error') return 'Ups! Ha ocurrido un error'
			if (this.type == 'success') return 'Listo!'
			return null
		},
		acceptText() {
			return this.accept || 'Aceptar'
		},
		cancelText() {
			if (this.cancel) return this.cancel
			let { canceled, accepted } = this.$listeners
			if (canceled || accepted) return 'Cancelar'
			return null
		},
		hasContent() {
			return this.text || this.code || this.description || this.$slots.default
		},
		actionsAlignClass() {
			return this.actionsRight ? 'justify-end' : 'justify-center'
		},
	},
	model: {
		prop: 'visible',
		event: 'toggled',
	},
	methods: {
		close() {
			this.$emit('toggled', false)
		},
		open() {
			this.$emit('toggled', true)
		},
		canceled() {
			this.close()
			this.$emit('canceled')
		},
		accepted() {
			this.close()
			this.$emit('accepted')
		},
	},
}
</script>

<template>
	<v-dialog :value="visible" :max-width="maxWidth" persistent scrollable>
		<v-card>
			<v-card-title class="headline" v-if="titleText">
				{{ titleText }}
			</v-card-title>
			<v-card-text v-if="hasContent" :style="{ maxHeight: `${maxContentHeight}px` }">
				<slot>
					<div v-if="text" class="pb-4">{{ text }}</div>
					<div v-if="code">[CODE: {{ code }}]</div>
					<div v-if="description">
						<pre style="white-space: pre-wrap;">{{ description }}</pre>
					</div>
				</slot>
			</v-card-text>
			<v-card-actions :class="actionsAlignClass">
				<v-btn color="" text @click="canceled" v-if="cancelText">
					{{ cancelText }}
				</v-btn>
				<v-btn color="success" text @click="accepted">
					{{ acceptText }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
