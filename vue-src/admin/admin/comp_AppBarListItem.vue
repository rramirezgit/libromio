<script>
export default {
	name: 'AppBarListItem',
}
</script>

<template>
	<v-hover v-slot="{ hover }">
		<v-list-item
			:class="{ primary: hover, 'elevation-6': hover }"
			:dark="hover"
			link
			v-bind="$attrs"
			v-on="$listeners"
		>
			<slot></slot>
		</v-list-item>
	</v-hover>
</template>
