<script>
export default {
	name: 'Validator',
	props: {
		validation: {
			type: Object,
		},
	},
	data() {
		return {
			comps: {},
			ids: 0,
		}
	},
	provide() {
		return {
			registerValidatorComponent: (comp) => {
				if (
					typeof comp.setValidation == 'function' &&
					typeof comp.getValidatorKey == 'function'
				) {
					let id = (this.ids += 1)
					this.comps[`comp_${id}`] = comp
					return id
				} else {
					return null
				}
			},
			unregisterValidatorComponent: (id) => {
				delete this.comps[`comp_${id}`]
			},
		}
	},
	watch: {
		validation: {
			handler() {
				this.validate()
			},
			deep: true,
		},
	},
	methods: {
		validate() {
			let firstError = false
			for (let comp of Object.values(this.comps)) {
				let key = comp.getValidatorKey()
				if (!key) continue
				let error = this.validation[key]
				comp.setValidation(error)
				if (!firstError && error && comp.focus) {
					firstError = true
					comp.focus()
				}
			}
		},
	},
	render() {
		return this.$slots.default
	},
}
</script>
