<script>
export default {
	name: 'CollectionsTable',
	data() {
		return {
			search: '',
			headers: [
				{ text: 'NOMBRE ID', value: 'keyname' },
				{ text: '', value: 'actions', sortable: false, align: 'end' },
			],
			loading: false,
			items: [],
			activeCollection: null,
		}
	},
	computed: {
		itemsPerPage() {
			return this.items.length
		},
	},
	watch: {},
	methods: {
		async loadData() {
			await this.$adminApi.get({
				url: '/catalog/collection',
				loading: (v) => (this.loading = v),
				onSuccess: ({ data }) => {
					this.items = data.collections
				},
				cache: true,
			})
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
			:items="items"
			:search="search"
			class="elevation-4"
			hide-default-footer
			:loading="loading"
			:items-per-page="itemsPerPage"
		>
			<template v-slot:top>
				<v-toolbar flat>
					<v-toolbar-title>Colecciones</v-toolbar-title>
					<v-divider class="mx-4" inset vertical></v-divider>
					<TextField
						v-model="search"
						append-icon="mdi-magnify"
						label="Buscar colecciones..."
						single-line
						hide-details
						dense
					/>
					<v-divider class="mx-4" inset vertical></v-divider>
					<Button color="primary" @click="activeCollection = {}">
						<v-icon>mdi-plus</v-icon> Crear colección
					</Button>
				</v-toolbar>
			</template>
			<template v-slot:item.actions="{ item }">
				<Button color="primary" text @click="activeCollection = item" small>
					<v-icon class="mr-1">mdi-pencil</v-icon> Editar
				</Button>
				<Button
					color="secondary"
					text
					:to="{ name: 'products', query: { collectionId: item.id } }"
					small
				>
					<v-icon class="mr-1">mdi-eye</v-icon> Ver productos
				</Button>
			</template>
		</v-data-table>
		<CollectionDialog
			v-model="activeCollection"
			@saved="loadData"
			@deleted="loadData"
		/>
	</div>
</template>
