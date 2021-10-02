<script>
import { VSelect } from 'vuetify/lib'
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'Select',
	extends: VSelect,
	mixins: [inputMixin],
}
</script>
