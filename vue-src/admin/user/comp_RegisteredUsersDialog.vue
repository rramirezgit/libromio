<script>
import itemDialogMixin from '@/admin/admin/mixin_item-dialog'
export default {
	name: 'RegisteredUsersDialog',
	mixins: [itemDialogMixin('user')],
	data() {
		return {
			blacklistLoading: false,
			resetPasswordLoading: false,
			rawPassword: null,
			randomPassword: false,
			resetPasswordValidation: {},
		}
	},
	watch: {
		randomPassword() {
			this.rawPassword = null
		},
	},
	methods: {
		switchBlackListed() {
			let blacklisted = !this.user.blacklisted
			let confirmTitle = blacklisted ? 'Poner en Blacklist' : 'Sacar de Blacklist'
			let confirmText = blacklisted
				? 'El usuario ya no podrá acceder a su cuenta ni realizar ningún tipo de acción.'
				: 'El usuario tendrá nuevamente acceso a su cuenta y podrá operar de forma habitual.'
			confirmText += ' ¿Desea continuar?'

			this.$adminApi.put({
				url: `/users/blacklist/${this.user.id}`,
				data: { blacklisted },
				loading: (v) => (this.blacklistLoading = v),
				confirm: { title: confirmTitle, text: confirmText },
				onSuccess: () => {
					this.user.blacklisted = blacklisted
					this.$emit('blacklisted', blacklisted)
				},
			})
		},
		resetPassword() {
			this.$adminApi.put({
				url: `/users/reset-password/${this.user.id}`,
				loading: (v) => (this.resetPasswordLoading = v),
				data: {
					randomPassword: this.randomPassword,
					rawPassword: this.rawPassword,
				},
				successMessage: ({ data }) => ({
					title: 'Listo!',
					text: `La contraseña se ha reestablecido correctamente. La nueva contraseña es: ${data.rawPassword}`,
				}),
				onSuccess: () => {
					this.randomPassword = false
					this.rawPassword = null
				},
				onValidation: ({ validation }) => (this.resetPasswordValidation = validation),
			})
		},
	},
	craeted() {
		this.rawPassword = null
		this.randomPassword = false
	},
}
</script>

<template>
	<ItemDialog v-model="dialog" title-text="Usuario" :loading="loading" :loading-delete="loadingDelete">
		<cont>
			<row>
				<c>
					<TextField readonly dense :value="user.accountEmail" label="Email de Cuenta" />
				</c>
				<c v-if="user.accountEmail != user.contactEmail">
					<TextField readonly dense :value="user.contactEmail" label="Email de Contacto" />
				</c>
				<c md="6">
					<TextField readonly dense :value="user.firstname" label="Nombre" />
				</c>
				<c md="6">
					<TextField readonly dense :value="user.lastname" label="Apellido" />
				</c>
				<c>
					<Subtitle text="Reestablecer contraseña" icon="mdi-lock" />
				</c>
				<c>
					<Validator :validation="resetPasswordValidation">
						<div class="d-flex align-center flex-wrap flex-md-nowrap">
							<TextField
								v-model="rawPassword"
								label="Nueva contraseña"
								:disabled="randomPassword"
								class="mr-3"
							/>
							<v-switch v-model="randomPassword" label="Aleatoria" class="mr-12" />
							<Button :loading="resetPasswordLoading" @click="resetPassword" color="success">
								Reestablecer
							</Button>
						</div>
					</Validator>
				</c>
				<c>
					<Subtitle text="Blacklist" icon="mdi-format-list-bulleted" />
				</c>
				<c>
					<Button v-if="user.blacklisted" :loading="blacklistLoading" @click="switchBlackListed">
						<v-icon class="mr-1">mdi-playlist-minus</v-icon> Sacar de blacklist
					</Button>
					<Button v-else :loading="blacklistLoading" @click="switchBlackListed" color="black" dark>
						<v-icon class="mr-1">mdi-playlist-plus</v-icon> Poner en blacklist
					</Button>
				</c>
			</row>
		</cont>
		<template #actions="{closeDialog}">
			<v-spacer />
			<Button text @click="closeDialog">Cerrar</Button>
		</template>
	</ItemDialog>
</template>
