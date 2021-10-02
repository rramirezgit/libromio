<script>
export default {
	name: 'ProductForm-Publication',
	props: {
		productModel: Object,
	},
	data() {
		return {
			product: this.productModel,
			allTags: ['tag1', 'tag2'],
		}
	},
	methods: {
		setProductDefaults() {
			this.$set(
				this.product,
				'active',
				this.product.active === undefined ? true : this.product.active
			)
		},
	},
	created() {
		this.setProductDefaults()
	},
}
</script>

<template>
	<cont>
		<row>
			<c>
				<Subtitle text="Estado de la publicación" />
			</c>
			<c>
				<v-btn-toggle v-model="product.active">
					<Button color="success" text :value="true">
						<v-icon color="success">mdi-play</v-icon> Activa
					</Button>
					<Button color="black" text :value="false">
						<v-icon color="black">mdi-pause</v-icon> Pausada
					</Button>
				</v-btn-toggle>
			</c>
			<c>
				<Subtitle text="Programar publicación" />
			</c>
			<c md="6">
				<DatePickerDialog
					v-model="product.activeFrom"
					label="Publicar a partir de esta fecha"
					hint="El producto será publicado siempre y cuando la publicación esté activa"
					persistent-hint
				/>
			</c>
		</row>
	</cont>
</template>
