<script>
export default {
	name: 'AppBarNotifications',

	data: () => ({
		notifications: [
			'Mike John Responded to your email',
			'You have 5 new tasks',
			"You're now friends with Andrew",
			'Another Notification',
			'Another one',
		],
	}),
}
</script>

<template>
	<v-menu
		bottom
		left
		offset-y
		origin="top right"
		transition="scale-transition"
	>
		<template v-slot:activator="{ attrs, on }">
			<v-btn class="ml-2" min-width="0" text v-bind="attrs" v-on="on">
				<v-badge bordered color="red" overlap>
					<template v-slot:badge>
						<span>5</span>
					</template>

					<v-icon>mdi-bell</v-icon>
				</v-badge>
			</v-btn>
		</template>

		<v-list flat nav>
			<AppBarListItem v-for="(n, i) in notifications" :key="i">
				<v-list-item-content>
					<v-list-item-title>{{ n }} </v-list-item-title>
				</v-list-item-content>
			</AppBarListItem>
		</v-list>
	</v-menu>
</template>
