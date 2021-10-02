<script>
import { VFileInput } from 'vuetify/lib'
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'FileInput',
	extends: VFileInput,
	mixins: [inputMixin],
}
</script>
