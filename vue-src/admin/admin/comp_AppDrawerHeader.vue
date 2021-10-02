<script>
// Utilities
import { get } from 'vuex-pathify'

export default {
	name: 'DrawerHeader',
	computed: {
		admin: get('app/admin'),
	},
}
</script>

<template>
	<v-list-item class="mb-0 justify-space-between pl-3">
		<v-list-item-avatar>
			<v-icon x-large>mdi-account</v-icon>
		</v-list-item-avatar>
		<v-list-item-title>
			{{ admin.username }}
			<br />
			<span class="font-weight-light caption">{{ admin.email }}</span>
		</v-list-item-title>
	</v-list-item>
</template>
