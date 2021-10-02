let makeMessagesArr = (messages) => {
	let arr = []
	if (messages) arr = Array.isArray(messages) ? messages : [messages]
	return arr.filter((msg) => !!msg)
}

export default {
	inject: {
		registerValidatorComponent: {
			default: null,
		},
		unregisterValidatorComponent: {
			default: null,
		},
	},
	props: {
		outlined: {
			default: true,
		},
		hideDetails: {
			default: 'auto',
		},
		validatorKey: {
			type: String,
		},
		errorMessages: {
			type: [String, Array],
			default: () => [],
		},
	},
	data() {
		return {
			internalValidationErrors: [],
			internalValidatorId: null,
		}
	},
	created() {
		if (this.registerValidatorComponent) {
			this.internalValidatorId = this.registerValidatorComponent(this)
		}
	},
	beforeDestroy() {
		if (this.internalValidatorId) {
			this.unregisterValidatorComponent(this.internalValidatorId)
		}
	},
	computed: {
		hasError() {
			return (
				this.internalErrorMessages.length > 0 ||
				(this.errorBucket && this.errorBucket.length > 0) ||
				this.error
			)
		},
		internalErrorMessages() {
			return makeMessagesArr(this.errorMessages).concat(
				makeMessagesArr(this.internalValidationErrors)
			)
		},
		validationErrors() {
			return this.internalErrorMessages
		},
	},
	methods: {
		setValidation(errors) {
			this.internalValidationErrors = errors
		},
		getValidatorKey() {
			return (
				this.validatorKey ||
				(this.$vnode.data.model && this.$vnode.data.model.expression)
			)
		},
	},
}
