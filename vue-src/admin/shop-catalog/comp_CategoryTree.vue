<script>
export default {
	name: 'CategoryTree',
	data() {
		return {
			search: null,
			categories: [],
			activeCategory: null,
			loading: false,
		}
	},
	methods: {
		async loadData() {
			await this.$adminApi.get({
				loading: (v) => (this.loading = v),
				url: '/catalog/categories',
				query: { tree: true, sortBy: 'menuPos' },
				onSuccess: ({ data }) => {
					this.categories = data.categories
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
		<v-card class="mx-auto" max-width="100%" :loading="loading">
			<v-sheet class="pa-4 d-flex flex-wrap">
				<v-toolbar flat>
					<v-toolbar-title>Categorías</v-toolbar-title>
					<v-divider class="mx-4" inset vertical></v-divider>
					<v-text-field
						v-model="search"
						label="Buscar..."
						flat
						hide-details
						clearable
						clear-icon="mdi-close-circle-outline"
						append-icon="mdi-magnify"
					></v-text-field>
					<v-divider class="mx-4" inset vertical></v-divider>
					<v-btn color="primary" @click="activeCategory = {}">
						<v-icon>mdi-plus</v-icon> Crear categoría
					</v-btn>
				</v-toolbar>
			</v-sheet>
			<v-card-text>
				<v-treeview :items="categories" :search="search" open-on-click>
					<template v-slot:prepend="{ item }">
						<v-icon v-if="item.children"></v-icon>
						<v-btn
							small
							text
							color="primary"
							@click.stop="activeCategory = item"
						>
							<v-icon>
								mdi-playlist-edit
							</v-icon>
						</v-btn>
					</template>
				</v-treeview>
			</v-card-text>
		</v-card>
		<CategoryDialog
			v-model="activeCategory"
			@saved="loadData"
			@deleted="loadData"
		/>
	</div>
</template>
