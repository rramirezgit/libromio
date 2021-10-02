<script>
export default {
	name: 'FrequentlyAsked',
	data() {
		return {
			items: this.$srv('ExpansionTabs', []),
		}
	},
}
</script>

<template>
	<Container class="pt-16 mb-16">
		<v-row>
			<v-col cols="12">
				<div class="text-center font-6 font-weight-bold primary--text">
					Preguntas Frecuentes
				</div>
			</v-col>
			<v-col cols="12">
				<v-expansion-panels active-class="is-active" focusable flat>
					<v-expansion-panel v-for="(item, i) in items" :key="i" class="mb-3">
						<v-expansion-panel-header
							class="tab-header primary-dark-purple--text font-2 font-weight-bold"
							>{{ `${i + 1}. ${item.title}` }}</v-expansion-panel-header
						>
						<v-expansion-panel-content class="mt-4">
							{{ item.content }}
						</v-expansion-panel-content>
					</v-expansion-panel>
				</v-expansion-panels>
			</v-col>
		</v-row>
	</Container>
</template>

<style scoped>
.tab-header {
	border: 1px solid #524b8e;
	border-radius: 16px !important;
}

.is-active .tab-header {
	color: #fff !important;
	background-color: #524b8e;
}
</style>
