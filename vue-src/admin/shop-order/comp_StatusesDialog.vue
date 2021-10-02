<script>
import itemDialogMixin from '@/admin/admin/mixin_item-dialog'
export default {
	name: 'StatusesDialog',
	mixins: [itemDialogMixin('statusData')],
	data() {
		return {
			statuses: {},
			selectedModel: null,
			updatingStatusLoading: false,
			loadingStatuses: false,
		}
	},
	methods: {
		updateStatus() {
			this.$adminApi.put({
				url: `/sales/order/${this.statusData.orderId}/update${this.statusData.statusType}status`,
				data: { key: this.selectedModel },
				loading: (v) => (this.updatingStatusLoading = v),
				confirm: {
					title: '¿Estás seguro?',
					text: `Vas a actualizar el estado de ${this.statusData.title}`,
				},
				successMessage: {
					title: 'Listo!',
					text: `Se ha actualizado el estado de ${this.statusData.title}`,
				},
				onSuccess: () => {
					this.dialog = false
					this.$emit('updateOrder')
				},
			})
		},
		async getStatuses() {
			await this.$adminApi.get({
				url: `/sales/order/${this.statusData.orderId}/${this.statusData.statusType}statuses`,
				loading: (v) => (this.loadingStatuses = v),
				onSuccess: ({ data }) => {
					this.statuses = data.statuses
					console.log(data)
					this.setCurrent()
				},
			})
		},
		setCurrent() {
			for (let [key, item] of Object.entries(this.statuses)) {
				if (item.current) {
					this.selectedModel = key
					return
				}
			}
		},
	},
}
</script>

<template>
	<ItemDialog
		v-model="dialog"
		:loading="loading"
		:deletable="false"
		transition="dialog-bottom-transition"
		no-actions
		@openDialog="getStatuses"
	>
		<template #header="{closeDialog}">
			<div>Estado de {{ statusData.title }}</div>
			<v-spacer />
			<Button text color="primary" @click="closeDialog">
				Cerrar
			</Button>
		</template>
		<cont>
			<row>
				<c>
					<v-progress-circular indeterminate size="80" v-if="loadingStatuses"> </v-progress-circular>
					<v-radio-group v-model="selectedModel" v-else>
						<v-radio
							v-for="item in statuses"
							:key="item.key"
							:label="item.name"
							:value="item.key"
							:disabled="!item.assignable && !item.current"
						>
						</v-radio>
					</v-radio-group>
				</c>
			</row>
			<row>
				<c>
					<Button @click="updateStatus" :loading="updatingStatusLoading" color="primary">
						Actualizar
					</Button>
				</c>
			</row>
		</cont>
	</ItemDialog>
</template>
