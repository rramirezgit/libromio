<script>
import { get } from 'vuex-pathify'
export default {
	computed: {
		userData: get('shop/user'),
	},
}
</script>

<template>
	<UserpanelLayout title="Mi cuenta">
		<v-row>
			<v-col cols="12">
				<CardLayout title="Datos de contacto" :showIcon="false">
					<ContactData />
				</CardLayout>
			</v-col>
			<v-col cols="12" md="6">
				<CardLayout title="Acceso" :showIcon="false">
					<UserData />
				</CardLayout>
			</v-col>
			<v-col cols="12" md="6">
				<CardLayout title="Cambiar contraseña" :showIcon="false">
					<ChangePassword />
				</CardLayout>
			</v-col>
		</v-row>
	</UserpanelLayout>
</template>
