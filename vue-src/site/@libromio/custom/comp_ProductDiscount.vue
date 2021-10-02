<script>
import { BaseProductDiscount } from '@/site/autoloader'

export default {
	extends: BaseProductDiscount,
	props: {
		customClass: {
			type: String,
			default: 'white--text primary-red rounded-xl pl-3 pr-3 ml-2 ',
		},
	},
}
</script>
