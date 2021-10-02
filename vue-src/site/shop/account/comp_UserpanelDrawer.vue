<script>
export default {
	name: 'UserpanelDrawer',
	data() {
		return {
			items: [
				{ title: 'Mi cuenta', icon: 'mdi-account', attrs: { to: { name: 'user.account' } } },
				{ title: 'Mis compras', icon: 'mdi-shopping', attrs: { to: { name: 'user.orders' } } },
				{ title: 'Mis favoritos', icon: 'mdi-heart', attrs: { to: { name: 'user.favorites' } } },
				{
					title: 'Salir',
					icon: 'mdi-account-off-outline',
					attrs: { loading: false },
					listeners: { click: () => this.logout() },
				},
			],
		}
	},
	methods: {
		logout() {
			this.$shopApi.post({
				url: '/user/logout',
				loading: (v) => (this.items[3].attrs.loading = v),
				onSuccess: () => {
					this.$store.set('shop/user', null)
					this.$router.push({ name: 'home' })
				},
			})
		},
	},
}
</script>

<template>
	<div class="d-flex flex-row flex-wrap flex-sm-column">
		<v-btn
			text
			v-for="item in items"
			:key="item.title"
			class="mb-4 justify-center justify-sm-start"
			v-bind="item.attrs"
			v-on="item.listeners"
			:style="{ width: $vuetify.breakpoint.xs ? '50%' : '100%' }"
		>
			<v-icon class="mr-1 mr-md-8">{{ item.icon }}</v-icon>
			<div class="text-no-wrap">{{ item.title }}</div>
		</v-btn>
	</div>
</template>

<style scoped></style>
