<script>
export default {
	name: 'BrandsTable',
	data() {
		return {
			search: '',
			headers: [
				{ text: 'Logo', value: 'logoUrl', sortable: false },
				{ text: 'Marca', value: 'name' },
				{ text: 'Actions', value: 'actions', sortable: false },
			],
			items: [],
			activeBrand: null,
			loading: false,
		}
	},
	computed: {
		itemsPerPage() {
			return this.items.length
		},
	},
	methods: {
		async loadData() {
			await this.$adminApi.get({
				url: '/catalog/brands',
				loading: (v) => (this.loading = v),
				onSuccess: ({ data }) => {
					this.items = data.brands
				},
				cache: true,
			})
		},
		onBrandSaved() {
			this.loadData()
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
			:loading="loading"
			hide-default-footer
			sort-by="name"
			:items-per-page="itemsPerPage"
		>
			<template v-slot:top>
				<v-toolbar flat>
					<v-toolbar-title>Marcas</v-toolbar-title>
					<v-divider class="mx-4" inset vertical></v-divider>
					<TextField
						v-model="search"
						append-icon="mdi-magnify"
						label="Buscar..."
						single-line
						dense
					/>
					<v-divider class="mx-4" inset vertical></v-divider>
					<Button color="primary" @click="activeBrand = {}">
						<v-icon>mdi-plus</v-icon> Crear Marca
					</Button>
				</v-toolbar>
			</template>
			<template v-slot:item.logoUrl="{ item }">
				<div>
					<v-img :src="item.logoUrl" max-height="50" max-width="50" />
				</div>
			</template>
			<template v-slot:item.actions="{ item }">
				<Button color="primary" text @click="activeBrand = item">
					<v-icon>
						mdi-pencil
					</v-icon>
				</Button>
			</template>
		</v-data-table>
		<BrandsDialog
			v-model="activeBrand"
			@saved="loadData"
			@deleted="loadData"
		/>
	</div>
</template>
