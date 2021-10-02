<script>
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'BrandsSelector',
	mixins: [inputMixin],
	props: {
		brandId: Number,
	},
	model: {
		prop: 'brandId',
		event: 'changed',
	},
	data: () => ({
		items: [],
		loading: false,
		loaded: false,
		inputText: '',
		activeBrand: null,
	}),
	methods: {
		async loadData() {
			if (this.loaded || this.loading) return
			await this.$adminApi.get({
				url: '/catalog/brands',
				query: { scope: 'combobox' },
				onSuccess: ({ data }) => {
					this.items = data.brands
					this.loaded = true
				},
				loading: (v) => (this.loading = v),
				cache: true,
			})
		},
		onInput($event) {
			this.$emit('changed', $event)
		},
		focus() {
			this.$refs.autocomplete.focus()
		},
		onBrandCreated(brand) {
			this.$emit('changed', brand.id)
			this.items.push(brand)
		},
	},
	created() {
		this.loadData()
	},
}
</script>

<template>
	<div>
		<Autocomplete
			ref="autocomplete"
			label="Marca"
			placeholder="Buscar..."
			@input="onInput"
			:items="items"
			item-text="name"
			item-value="id"
			:loading="loading"
			no-data-text="No se han encontrado resultados..."
			:search-input.sync="inputText"
			:hide-no-data="loading"
			:value="brandId"
			:error-messages="validationErrors"
			v-bind="$attrs"
		>
			<template v-slot:append>
				<v-btn text color="success" x-small @click="activeBrand = {}">
					<v-icon>mdi-plus</v-icon> Crear
				</v-btn>
			</template>
			<template v-slot:no-data>
				<div class="text-center pa-2">
					<v-btn text color="success" small class="mt-2" @click="activeBrand = { name: inputText }">
						<v-icon>mdi-plus</v-icon> Crear marca <b>`{{ inputText }}`</b>
					</v-btn>
				</div>
			</template>
		</Autocomplete>
		<BrandsDialog v-model="activeBrand" @saved="onBrandCreated" />
	</div>
</template>
