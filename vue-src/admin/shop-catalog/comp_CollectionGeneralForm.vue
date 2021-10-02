<script>
export default {
	name: 'CollectionGeneralForm',
	data() {
		return {
			item: {
				name: '',
				isInShop: false,
				title: '',
				hasFilter: false,
				filterColor: '',
				isSpecialCollection: false,
				hasImage: false,
				imageSize: '',
				refersToCategory: false,
				showRandomProduct: false,
				productsQty: 0,
			},
			inputsWidth: '345',
		}
	},
	watch: {
		item: {
			handler() {
				console.log(this.isInShop)
			},
			deep: true,
		},
	},
}
</script>

<template>
	<div>
		<cont fluid>
			<row>
				<c lg="6">
					<TextField v-model="item.name" label="Nombre ID" />
				</c>
			</row>
		</cont>
		<v-divider></v-divider>
		<cont fluid>
			<row>
				<c md="6" lg="5">
					<v-switch
						v-model="item.isInShop"
						inset
						color="success"
						:label="
							`La colección está ${
								item.isInShop ? 'habilitada' : 'inhabilitada'
							} en el shop`
						"
					></v-switch>
				</c>
				<c md="6" lg="5" v-if="item.isInShop">
					<TextField v-model="item.title" label="Título de la colección" />
				</c>
				<c md="6" lg="5" v-if="item.isInShop">
					<v-checkbox
						v-model="item.hasFilter"
						label="Mostrar filtro en el ESHOP"
					></v-checkbox>
				</c>
				<c md="6" lg="5" v-if="item.hasFilter">
					<TextField v-model="item.filterColor" label="Color del filtro" />
				</c>
			</row>
		</cont>
		<v-divider></v-divider>
		<cont fluid>
			<row>
				<c md="6" lg="5">
					<v-switch
						v-model="item.isSpecialCollection"
						inset
						color="success"
						label="Colección especial del tema"
					></v-switch>
				</c>
				<c md="6" lg="5" v-if="item.isSpecialCollection">
					<TextField
						v-model="item.productsQty"
						type="number"
						label="Cantidad de productos a mostrar"
					/>
				</c>
				<c md="6" lg="5" v-if="item.isSpecialCollection" class="pb-0">
					<v-checkbox
						v-model="item.hasImage"
						label="Tiene Imagen"
					></v-checkbox>
				</c>
				<c md="6" lg="5" v-if="item.hasImage">
					<TextField
						v-model="item.imageSize"
						label="Tamaño de la imagen (Requerido)"
					/>
				</c>
				<c v-if="item.isSpecialCollection" class="pt-0 pb-0">
					<v-checkbox
						v-model="item.refersToCategory"
						label="Refiere a una categoría"
					></v-checkbox>
				</c>
				<c v-if="item.isSpecialCollection" class="pt-0">
					<v-checkbox
						v-model="item.showRandomProduct"
						label="Mostrar productos aleatoriamente"
					></v-checkbox>
				</c>
			</row>
		</cont>
	</div>
</template>
