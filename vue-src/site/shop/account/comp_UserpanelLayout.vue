<script>
export default {
	name: 'UserpanelLayout',
	metaInfo() {
		return {
			title: this.title,
		}
	},
	props: {
		title: String,
	},
}
</script>

<template>
	<Container class="mb-16">
		<v-row>
			<v-col cols="12" md="3" class="px-0 px-sm-6 pt-sm-6">
				<UserpanelDrawer />
			</v-col>
			<v-col cols="12" md="9" class="pt-5">
				<div class="text-h4 mb-4">
					{{ title }}
				</div>
				<v-divider class="mb-4"></v-divider>
				<slot> </slot>
			</v-col>
		</v-row>
	</Container>
</template>

<style></style>
