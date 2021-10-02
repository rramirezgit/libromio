<script>
import inputMixin from '@/admin/admin/mixin_input'
export default {
	name: 'CollectionSelector',
	mixins: [inputMixin],
	props: {
		collectionId: Number,
		label: {
			type: String,
			default: 'Colección',
		},
		canCreate: Boolean,
	},
	model: {
		prop: 'collectionId',
		event: 'updateModel',
	},
	data() {
		return {
			items: [],
			activeCollection: null,
			loading: false,
		}
	},
	methods: {
		async loadData() {
			await this.$adminApi.get({
				loading: (v) => (this.loading = v),
				url: '/catalog/collection',
				onSuccess: ({ data }) => {
					this.items = data.collections
				},
				cache: true,
			})
		},
		onInput(collectionId) {
			this.$emit('updateModel', collectionId)
		},
		focus() {
			this.$refs.autocomplete.focus()
		},
		async onCollectionCreated(collectionId) {
			await this.loadData()
			this.onInput(collectionId)
		},
	},

	async created() {
		await this.loadData()
	},
}
</script>

<template>
	<div>
		<Autocomplete
			ref="autocomplete"
			:label="label"
			placeholder="Buscar..."
			:value="collectionId"
			@input="onInput"
			:items="items"
			item-text="keyname"
			item-value="id"
			:loading="loading"
			:hide-no-data="loading"
			no-data-text="No se han encontrado resultados..."
			:error-messages="validationErrors"
			v-bind="$attrs"
		>
			<template v-slot:append>
				<v-btn v-if="canCreate" @click="activeCollection = {}" text color="success" x-small>
					<v-icon>mdi-plus</v-icon> Crear
				</v-btn>
			</template>
		</Autocomplete>
		<CollectionDialog v-model="activeCollection" @saved="onCollectionCreated" />
	</div>
</template>
