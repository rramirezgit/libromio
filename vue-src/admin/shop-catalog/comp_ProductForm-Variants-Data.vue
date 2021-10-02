<script>
export default {
	name: 'ProductForm-Variants-Data',
	inject: ['getMetric', 'pricesConfigs'],
	props: {
		productModel: Object,
		variantModel: Object,
		validatorKey: String,
	},
	data() {
		return {
			product: this.productModel,
			variant: this.variantModel,
		}
	},
	computed: {
		isDev() {
			return process.env.NODE_ENV == 'development'
		},
	},
	methods: {
		setupPrices() {
			for (let priceConfig of this.pricesConfigs) {
				let found = !!this.variant.pvPrices.find((pvPrice) => pvPrice.priceConfig.id == priceConfig.id)
				if (!found) {
					let newPvPrice = { priceConfig, basePrice: 0, extraDiscountPct: 0 }
					this.variant.pvPrices = this.variant.pvPrices.concat(newPvPrice)
				}
			}
		},
		setProductDefaults() {
			this.$set(this.variant, 'stock', this.variant.stock || {})
			this.$set(this.variant, 'size', this.variant.size || 0)
			this.$set(this.variant, 'weight', this.variant.weight || 0)
			this.$set(this.variant, 'editing_digital', false)
			this.$set(this.variant, 'type', this.variant.type || 'physical')
			this.$set(this.variant, 'pvPrices', this.variant.pvPrices || [])
			this.$set(this.variant, 'attrs', this.variant.attrs || [])
			this.setupPrices()
		},
	},
	created() {
		this.setProductDefaults()
		//console.log(this.variant.pvPrices)
	},
}
</script>

<template>
	<div>
		<row>
			<c>
				<v-simple-table dense>
					<thead>
						<tr>
							<th>SKU</th>
							<th>EAN</th>
							<th v-if="product.priceMetric">
								Relación precio / unidad
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="py-3">
								<TextField v-model="variant.sku" :validator-key="`${validatorKey}.sku`" dense />
							</td>
							<td>
								<TextField v-model="variant.ean" :validator-key="`${validatorKey}.ean`" dense />
							</td>
							<td v-if="product.priceMetric">
								<TextField
									label=""
									v-model="variant.metricFactor"
									:validator-key="`${validatorKey}.metricFactor`"
									:suffix="`${getMetric('price', true)} = 1 ${getMetric('unit', false)}`"
									type="number"
									dense
								/>
							</td>
						</tr>
					</tbody>
				</v-simple-table>
			</c>
		</row>
		<row>
			<c>
				<v-simple-table dense>
					<thead>
						<tr>
							<th>Tipo de Producto</th>
							<th v-if="variant.type == 'digital'">Archivo</th>
							<th v-if="variant.type == 'physical'">Volumen</th>
							<th v-if="variant.type == 'physical'">Peso</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="py-3" style="width: 200px;">
								<Select
									v-model="variant.type"
									:items="[
										{ text: 'Físico', value: 'physical' },
										{ text: 'Digital', value: 'digital' },
									]"
									:validator-key="`${validatorKey}.type`"
									dense
								/>
							</td>
							<td v-if="variant.type == 'digital'">
								<div class="d-flex align-center" v-if="!variant.digital || variant.editing_digital">
									<FileInput
										show-size
										truncate-length="100"
										dense
										v-model="variant.digitalFile"
										:validator-key="`${validatorKey}.digitalFile`"
									/>
									<Button
										text
										small
										color="secondary"
										@click="variant.editing_digital = false"
										v-if="variant.digital"
									>
										cancelar
									</Button>
								</div>
								<div class="d-flex align-center" v-else>
									<v-icon>mdi-paperclip</v-icon>
									<b class="px-1 px-2">{{ variant.digital.real }}</b>
									<Button text small color="secondary" @click="variant.editing_digital = true">
										editar
									</Button>
								</div>
							</td>
							<td v-if="variant.type == 'physical'">
								<TextField
									v-model="variant.size"
									:validator-key="`${validatorKey}.size`"
									suffix="mm3"
									dense
									:readonly="!isDev"
								/>
							</td>
							<td v-if="variant.type == 'physical'">
								<TextField
									v-model="variant.weight"
									:validator-key="`${validatorKey}.weight`"
									suffix="grs"
									dense
									:readonly="!isDev"
								/>
							</td>
						</tr>
					</tbody>
				</v-simple-table>
			</c>
		</row>
		<row>
			<c>
				<v-simple-table dense>
					<thead>
						<tr>
							<th>Stock</th>
							<th>Stock ilimitado</th>
							<th>Máx. cantidad comprable</th>
							<th>Entrega con demora</th>
							<th>Disponible a partir de</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<TextField
									v-model="variant.stock.qty"
									:validator-key="`${validatorKey}.stock.qty`"
									type="number"
									:suffix="getMetric('unit', true)"
									dense
									:readonly="!isDev"
								/>
							</td>

							<td>
								<v-switch v-model="variant.stock.infiniteQty" />
							</td>
							<td>
								<TextField
									placeholder="-"
									v-model="variant.stock.maxBuyableQty"
									:validator-key="`${validatorKey}.stock.maxBuyableQty`"
									:suffix="getMetric('unit', true)"
									type="number"
									dense
								/>
							</td>
							<td>
								<TextField
									placeholder="-"
									v-model="variant.stock.deferredDelivery"
									:validator-key="`${validatorKey}.stock.deferredDelivery`"
									suffix="días"
									type="number"
									dense
								/>
							</td>
							<td>
								<DatePickerDialog
									placeholder="-"
									v-model="variant.stock.availabilityDate"
									:validator-key="`${validatorKey}.stock.availabilityDate`"
									dense
								/>
							</td>
						</tr>
					</tbody>
				</v-simple-table>
			</c>
		</row>

		<row>
			<c>
				<v-simple-table dense>
					<thead>
						<tr>
							<th>ID</th>
							<th>Precio Base</th>
							<th>Precio Modificado</th>
							<th>Descuento General</th>
							<th>Descuento de Producto</th>
							<th>Resultado de Precio</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item of variant.pvPrices" :key="item.priceConfig.id">
							<td>
								{{ item.priceConfig.keyname.toUpperCase() }}
							</td>
							<td>
								<TextField
									label=""
									type="number"
									prefix="$"
									dense
									class="py-3"
									v-model="item.basePrice"
									:validator-key="`${validatorKey}.pvPrice.${item.priceConfig.keyname}.basePrice`"
									v-if="!item.priceConfig.relativeToId"
									:readonly="item.priceConfig.keyname == 'default' && false"
								/>
								<span v-else>
									{{ item.basePrice | price }}
									<small class="d-block">
										(Relativo a
										{{
											pricesConfigs
												.find(({ id }) => id == item.priceConfig.relativeToId)
												.keyname.toUpperCase()
										}})
									</small>
								</span>
							</td>
							<td>
								<small>
									({{ item.priceConfig.relativePct >= 0 ? '+' : '-'
									}}{{ Math.abs(item.priceConfig.relativePct) }}%)
								</small>
								{{ item.modifPrice | price }}
							</td>
							<td>
								<span v-if="item.configDiscountPct === undefined">N/D</span>
								<span v-else>{{ item.configDiscountPct }}%</span>
							</td>
							<td>
								<TextField
									label=""
									type="number"
									suffix="%"
									dense
									class="py-3"
									v-model="item.extraDiscountPct"
									:validator-key="
										`${validatorKey}.pvPrice.${item.priceConfig.keyname}.extraDiscountPct`
									"
								/>
							</td>
							<td style="vertical-align: middle;">
								<div class="text-center text-no-wrap">
									<div v-if="item.discountPct">
										<small>
											<del>{{ item.prevPrice | price }}</del>
										</small>
										<small class="error--text ml-1">{{ item.discountPct }}% OFF</small>
									</div>
									<div>
										<b>{{ item.price | price }}</b>
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</v-simple-table>
				<!-- <TextField
					:label="`Precio ${pvPrice.priceConfig.keyname.toUpperCase()}`"
					type="number"
					prefix="$"
					v-model="pvPrice.basePrice"
					:validator-key="`${validatorKey}.pvPrice.${pvPrice.priceConfig.keyname}.basePrice`"
				/> -->
			</c>
		</row>
	</div>
</template>

<style scoped>
.v-data-table >>> td {
	vertical-align: text-top;
	padding: 12px 8px !important;
}
.v-data-table >>> th {
	padding: 0 12px !important;
}
</style>
