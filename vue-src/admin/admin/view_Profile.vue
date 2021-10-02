<script>
export default {
	name: 'Profile',
	created() {
		this.$store.set('app/title', 'Mi cuenta')
	},
	data: () => ({
		currentItem: 'tab-profile-info',
	}),
}
</script>

<template>
	<div>
		<Tabs v-model="currentItem" class="mb-8">
			<v-tab href="#tab-profile-info">Mi cuenta</v-tab>
			<v-tab href="#tab-password">Cambiar contraseña</v-tab>
		</Tabs>
		<TabsItems v-model="currentItem">
			<v-tab-item value="tab-profile-info">
				<AdminUpdateInfoForm />
			</v-tab-item>
			<v-tab-item value="tab-password">
				<AdminChangePassForm />
			</v-tab-item>
		</TabsItems>
	</div>
</template>
