<script>
import { VTextarea } from 'vuetify/lib'
import inputMixin from './mixin_input'
export default {
	name: 'Textarea',
	extends: VTextarea,
	mixins: [inputMixin],
}
</script>
