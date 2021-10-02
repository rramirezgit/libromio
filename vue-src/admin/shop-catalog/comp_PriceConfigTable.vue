<script>
export default {
	name: 'PriceConfigTable',
	data() {
		return {
			headers: [
				{
					text: 'Nombre ID',
					value: 'keyname',
					sortable: false,
				},
				{
					text: 'Precio Base',
					value: 'relativeToId',
					sortable: false,
				},
				{
					text: 'Modificador de Precio',
					value: 'relativePct',
					sortable: false,
				},
				{
					text: 'Actions',
					value: 'actions',
					sortable: false,
				},
			],
			pricesConfigs: [],
			activePriceConfig: null,
			loading: false,
		}
	},
	computed: {
		itemsPerPage() {
			return this.pricesConfigs.length
		},
	},
	methods: {
		async loadData() {
			await this.$adminApi.get({
				url: `/catalog/price-config`,
				loading: (v) => (this.loading = v),
				onSuccess: ({ data }) => {
					this.pricesConfigs = data.pricesConfigs
				},
			})
		},
		getById(id) {
			return this.pricesConfigs.find((pc) => pc.id == id)
		},
	},
	created() {
		this.loadData()
	},
}
</script>

<template>
	<div>
		<v-data-table
			:headers="headers"
			:items="pricesConfigs"
			sort-by="id"
			class="elevation-4"
			hide-default-footer
			:loading="loading"
			:items-per-page="itemsPerPage"
		>
			<template v-slot:top>
				<v-toolbar flat>
					<v-toolbar-title>Configuraciones de Precios</v-toolbar-title>
					<v-spacer />
					<v-divider class="mx-4" inset vertical></v-divider>
					<Button color="primary" @click="activePriceConfig = {}">
						<v-icon>mdi-plus</v-icon> Crear configuración
					</Button>
				</v-toolbar>
			</template>
			<template v-slot:item.relativeToId="{ item }">
				<span v-if="item.relativeToId">
					Relativo a
					<i>
						<b>{{ getById(item.relativeToId).keyname }}</b>
					</i>
				</span>
				<span v-else>Seteo Manual</span>
			</template>
			<template v-slot:item.relativePct="{ item }">
				<span v-if="item.relativePct">
					{{ item.relativePct > 0 ? '+' : '-' }}
					{{ Math.abs(item.relativePct) }}%
				</span>
				<span v-else>-</span>
			</template>
			<template v-slot:item.actions="{ item }">
				<v-btn color="primary" text @click="activePriceConfig = item">
					<v-icon>
						mdi-pencil
					</v-icon>
				</v-btn>
			</template>
		</v-data-table>
		<PriceConfigDialog
			v-model="activePriceConfig"
			@saved="loadData"
			@deleted="loadData"
			:prices-configs="pricesConfigs"
		/>
	</div>
</template>
