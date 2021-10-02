<script>
import { VAutocomplete } from 'vuetify/lib'
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'Autocomplete',
	extends: VAutocomplete,
	mixins: [inputMixin],
}
</script>
