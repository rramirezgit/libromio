<script>
import { VCombobox } from 'vuetify/lib'
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'Combobox',
	extends: VCombobox,
	mixins: [inputMixin],
	created() {
		if (!this.multiple) {
			this.$on('update:search-input', (value) => {
				this.$emit('input', value)
			})
		}
	},
}
</script>
