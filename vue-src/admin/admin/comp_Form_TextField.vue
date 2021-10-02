<script>
import { VTextField } from 'vuetify/lib'
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'TextField',
	extends: VTextField,
	mixins: [inputMixin],
}
</script>
