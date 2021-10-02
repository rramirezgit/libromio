<script>
export default {
	name: 'MagicButton',
	props: {
		state: String,
		loading: Boolean,
	},
	model: {
		prop: 'state',
		event: 'updateState',
	},
	computed: {
		btnColor() {
			if (this.loading) return 'primary'
			switch (this.state) {
				case 'success':
					return 'success'
				case 'error':
					return 'error'
				default:
					return 'primary'
			}
		},
	},
	watch: {
		state(value) {
			if (value) {
				setTimeout(() => this.$emit('updateState', null), 3000)
			}
		},
	},
	methods: {
		onClick($event) {
			if (this.state) return
			this.$emit('click', $event)
		},
	},
}
</script>

<template>
	<v-btn v-bind="$attrs" :color="btnColor" :loading="loading" @click="onClick">
		<slot v-if="!state"></slot>
		<slot name="success" v-if="state == 'success'"></slot>
		<slot name="error" v-if="state == 'error'"></slot>
	</v-btn>
</template>
