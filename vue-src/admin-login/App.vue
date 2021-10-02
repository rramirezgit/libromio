<script>
export default {
	name: 'App',
}
</script>

<template>
	<v-app>
		<v-main class="primary">
			<v-container fill-height align="center">
				<v-row justify="center">
					<router-view />
				</v-row>
			</v-container>
		</v-main>
	</v-app>
</template>
