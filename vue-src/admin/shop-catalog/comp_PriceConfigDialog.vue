<script>
import itemDialogMixin from '@/admin/admin/mixin_item-dialog'
export default {
	name: 'PriceConfigDialog',
	mixins: [itemDialogMixin('priceConfig')],
	props: {
		pricesConfigs: Array,
	},
	data() {
		return {
			discountKey: 0,
		}
	},
	computed: {
		relativeSelectItems() {
			let opts = [
				{
					text: 'Seteo manual',
					value: null,
				},
			]
			return opts.concat(
				this.pricesConfigs
					.filter((priceConfig) => priceConfig.id != this.priceConfig.id)
					.map((priceConfig) => ({
						text: `Relativo a '${priceConfig.keyname}'`,
						value: priceConfig.id,
					}))
			)
		},
		isDefault() {
			return this.priceConfig.__keyname == 'default'
		},
	},
	watch: {
		dialog(value) {
			if (value) this.setPriceConfigDefaults()
		},
	},
	methods: {
		setPriceConfigDefaults() {
			this.$set(this.priceConfig, 'relativeToId', this.priceConfig.relativeToId || null)
			this.priceConfig.__keyname = this.priceConfig.keyname
			let discounts = this.priceConfig.discounts || []
			discounts.forEach((discount) => (discount.__key = this.discountKey++))
			discounts.sort((a, b) => (b.priority || 0) - (a.priority || 0))
			this.$set(this.priceConfig, 'discounts', discounts)
		},
		savePriceConfig() {
			let opts = {
				loading: (v) => (this.loading = v),
				onValidation: ({ validation }) => (this.validation = validation),
				data: { priceConfig: this.priceConfig },
				successMessage: {
					title: 'Listo!',
					text: `La Configuración de Precio se ha ${this.isNew ? 'creado' : 'guardado'} correctamente`,
				},
				onSuccess: ({ data }) => {
					this.dialog = false
					this.$emit('saved', data.priceConfigId)
				},
			}

			if (this.isNew) {
				this.$adminApi.post('/catalog/price-config', opts)
			} else {
				this.$adminApi.put(`/catalog/price-config/${this.priceConfig.id}`, opts)
			}
		},
		deletePriceConfig() {
			this.$adminApi.delete(`/catalog/price-config/${this.priceConfig.id}`, {
				loading: (v) => (this.loadingDelete = v),
				confirm: {
					title: `La configuración de precio '${this.priceConfig.keyname}' será eliminada`,
					text: '¿Desea continuar?',
					accept: 'Sí, eliminar',
				},
				onSuccess: () => {
					this.dialog = false
					this.$emit('deleted', this.priceConfig)
				},
			})
		},
		addDiscount() {
			this.priceConfig.discounts.push({ __key: this.discountKey++ })
		},
		removeDiscount(i) {
			this.priceConfig.discounts.splice(i, 1)
		},
	},
	created() {},
}
</script>

<template>
	<ItemDialog
		v-model="dialog"
		:title-text="isNew ? 'Nueva configuración de precio' : 'Editar configuración de precio'"
		:submit-text="isNew ? 'Crear' : 'Guardar'"
		:loading="loading"
		:loading-delete="loadingDelete"
		@submit="savePriceConfig"
		:deletable="!isNew && !isDefault"
		@delete="deletePriceConfig"
		max-width="800px"
	>
		<Validator :validation="validation">
			<div>
				<cont>
					<row>
						<c>
							<TextField v-model="priceConfig.keyname" label="Nombre ID" :disabled="isDefault" />
						</c>
						<c sm="6">
							<Select
								v-model="priceConfig.relativeToId"
								:items="relativeSelectItems"
								label="Precio Base"
								:disabled="isDefault"
							/>
						</c>
						<c sm="6">
							<TextField
								v-model="priceConfig.relativePct"
								label="Modificar precio en (%)"
								type="number"
								suffix="%"
							/>
						</c>
					</row>
				</cont>
				<v-divider></v-divider>
				<cont>
					<row>
						<v-toolbar flat class="pa-0">
							<v-toolbar-title>Descuentos generales</v-toolbar-title>
						</v-toolbar>
					</row>
					<row v-for="(discount, i) in priceConfig.discounts" :key="discount.__key">
						<c md="6">
							<TextField
								v-model="discount.displayName"
								label="Nombre del descuento"
								dense
								:validator-key="`priceConfig.discounts.${i}.displayName`"
							/>
						</c>
						<c cols="6" md="3">
							<TextField
								v-model="discount.discountPct"
								label="Descuento"
								suffix="%"
								dense
								:validator-key="`priceConfig.discounts.${i}.discountPct`"
							/>
						</c>
						<c cols="6" md="3">
							<TextField
								v-model="discount.priority"
								type="number"
								label="Prioridad"
								dense
								:validator-key="`priceConfig.discounts.${i}.priority`"
							/>
						</c>
						<c md="9">
							<CollectionSelector
								v-model="discount.collectionId"
								label="Aplicar solo a la colleción"
								dense
								can-create
								:validator-key="`priceConfig.discounts.${i}.collectionId`"
							/>
						</c>
						<c md="3">
							<v-btn small text color="error" @click="removeDiscount(i)">
								<v-icon>mdi-trash-can-outline</v-icon>
								Remover
							</v-btn>
						</c>
						<c>
							<v-divider />
						</c>
					</row>
					<row>
						<c>
							<v-btn small color="primary" text @click="addDiscount">
								<v-icon>mdi-plus</v-icon>
								Agregar descuento
							</v-btn>
						</c>
					</row>
				</cont>
			</div>
		</Validator>
	</ItemDialog>
</template>
