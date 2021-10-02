<script>
import { VTabs } from 'vuetify/lib'
export default {
	name: 'Tabs',
	extends: VTabs,
	props: {
		backgroundColor: {
			type: String,
			default: 'transparent',
		},
		dark: {
			type: Boolean,
			default: false,
		},
		showArrows: {
			type: Boolean,
			default: true,
		},
	},
}
</script>

<style>
.v-tabs {
	border-bottom: 1px solid #ddd;
}
</style>
