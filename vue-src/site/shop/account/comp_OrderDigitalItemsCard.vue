<script>
export default {
	name: 'OrderDigitalItemsCard',
	props: {
		order: Object,
	},
	computed: {
		digitalItems() {
			return this.order.items.filter((item) => item.type == 'digital')
		},
		hasDigitalItems() {
			return this.digitalItems.length
		},
	},
	methods: {
		download(item) {
			location.href = `/order/${this.order.id}/download-digital/${item.id}`
		},
	},
}
</script>

<template>
	<CardLayout title="Descarga de productos digitales" v-if="hasDigitalItems">
		<div v-for="item of digitalItems" :key="item.id" class="pb-4">
			<v-btn color="link" @click="download(item)" large text outlined height="80" class="text-left">
				<div class="d-flex align-center text-left">
					<v-icon class="mr-1" size="60">mdi-download-circle-outline</v-icon>
					<div>
						<div class="font-2">
							<b>{{ item.name }}</b>
						</div>
						<div v-if="item.variantName" class="font-1" style="text-transform: unset;">
							<small>{{ item.variantName }}</small>
						</div>
						<div class="grey--text font-1">
							<small>{{ item.digital.real }}</small>
						</div>
					</div>
				</div>
			</v-btn>
		</div>
	</CardLayout>
</template>
