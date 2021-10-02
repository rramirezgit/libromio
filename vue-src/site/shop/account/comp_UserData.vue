<script>
import { get } from 'vuex-pathify'
export default {
	name: 'UserData',
	computed: {
		userData: get('shop/user'),
		hasGoogleAccess() {
			return this.userData.googleId ? 'Si' : 'No'
		},
		hasFacebookAccess() {
			return this.userData.facebookId ? 'Si' : 'No'
		},
	},
}
</script>

<template>
	<div>
		<div class="mb-3">
			<div class="font-weight-bold">
				Email
			</div>
			<div>
				{{ userData.accountEmail }}
			</div>
		</div>
		<div>
			<div class="mb-3">
				<div class="font-weight-bold">
					Acceso con Google
				</div>
				<div>
					{{ hasGoogleAccess }}
				</div>
			</div>
			<div>
				<div class="font-weight-bold">
					Acceso con Facebook
				</div>
				<div>
					{{ hasFacebookAccess }}
				</div>
			</div>
		</div>
	</div>
</template>

<style></style>
