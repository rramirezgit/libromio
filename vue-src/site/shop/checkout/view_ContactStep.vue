<script>
import { get } from 'vuex-pathify'
import addressHelperMixin from '@/__shared/shop/mixin_address-helper.js'

export default {
	name: 'ContactStepPage',
	mixins: [addressHelperMixin],
	data() {
		return {
			buyer: {},
			invoiceId: null,
			invoices: [],
			invoice: {},
			invoiceAddressLine: null,
			invoiceAddress: null,
			addressDialog: false,
			validation: {},
		}
	},
	computed: {
		user: get('shop/user'),
		asCard() {
			return this.invoices.length > 0
		},
	},
	watch: {
		'invoice.business'() {
			this.$nextTick(() => {
				this.validation = { ...this.validation }
			})
		},
		invoiceAddress(value) {
			if (value) this.invoiceAddressLine = this.getAddressLine(value)
		},
	},
	methods: {
		onStepLoaded(data) {
			let payload = data.checkout.steps.contact || {}
			this.buyer = payload.buyer || {
				email: this.user.contactEmail,
				firstname: this.user.firstname,
				lastname: this.user.lastname,
				phonePrefix: this.user.phonePrefix,
				phoneNumber: this.user.phoneNumber,
			}
			this.invoices = data.invoices || []
			this.invoiceAddress = payload.invoiceAddress
			if (payload.invoiceId && this.invoices.find(({ id }) => id == payload.invoiceId)) {
				this.invoiceId = payload.invoiceId
			} else if (this.invoices.length) {
				this.invoiceId = this.invoices[0].id
			} else {
				this.invoice = {
					business: false,
					personFirstname: this.user.firstname,
					personLastname: this.user.lastname,
				}
			}
		},
	},
}
</script>

<template>
	<CheckoutLayout
		title="Contacto y Facturación"
		step="contact"
		@stepLoaded="onStepLoaded"
		@payloadValidation="validation = $event"
	>
		<template #step="{sendPayload, loading}">
			<form @submit.prevent>
				<Validator :validation="validation">
					<CardLayout>
						<div>
							<v-card-title>Datos de Contacto</v-card-title>
							<v-card-text>
								<v-row>
									<v-col cols="12">
										<TextField
											label="Email"
											v-model="buyer.email"
											hint="Ingresá una casilla de correo que uses habitualmente para recibir las notificaciones sobre el estado de tu compra"
											persistent-hint
										/>
									</v-col>
									<v-col cols="12" md="6">
										<TextField label="Nombre" v-model="buyer.firstname" />
									</v-col>
									<v-col cols="12" md="6">
										<TextField label="Apellido" v-model="buyer.lastname" />
									</v-col>
									<v-col cols="4" md="3">
										<TextField
											label="Prefijo"
											placeholder="011"
											type="tel"
											v-model="buyer.phonePrefix"
										/>
									</v-col>
									<v-col cols="8" md="4">
										<TextField
											label="Teléfono"
											placeholder="11111111"
											type="tel"
											v-model="buyer.phoneNumber"
										/>
									</v-col>
								</v-row>
							</v-card-text>
							<v-divider class="my-4"></v-divider>
							<v-card-title>
								Datos de Facturación
								<!-- <v-spacer></v-spacer>
								<v-btn-toggle v-model="invoice.business" mandatory>
									<v-btn color="blue darken-4" text :value="false" small>
										persona
									</v-btn>
									<v-btn color="blue darken-4" text :value="true" small>
										empresa
									</v-btn>
								</v-btn-toggle> -->
							</v-card-title>
							<v-card-text>
								<v-radio-group
									v-model="invoiceId"
									v-if="invoices.length"
									hide-details="auto"
									class="mt-0"
									mandatory
								>
									<v-radio v-for="inv of invoices" :key="inv.id" :value="inv.id" class="pb-3">
										<template #label>
											<div v-if="inv.business">
												{{ inv.businessName }}<br />
												CUIT {{ inv.businessIdNumber }}<br />
												Factura {{ inv.invoiceType }}<br />
											</div>
											<div v-else>
												{{ inv.personLastname }}, {{ inv.personFirstname }}<br />
												DNI {{ inv.personIdNumber }}<br />
											</div>
										</template>
									</v-radio>
									<v-radio label="Usar otros datos de facturación" :value="0" />
								</v-radio-group>
								<v-card
									v-show="!invoiceId"
									:class="{ 'mt-4 pa-10': asCard }"
									:elevation="asCard ? 4 : 0"
								>
									<v-btn-toggle v-model="invoice.business" mandatory class="mb-4">
										<v-btn color="blue darken-4" text :value="false" small>
											persona
										</v-btn>
										<v-btn color="blue darken-4" text :value="true" small>
											empresa
										</v-btn>
									</v-btn-toggle>
									<v-row v-if="invoice.business">
										<v-col cols="12">
											<TextField label="Razón Social" v-model="invoice.businessName" />
										</v-col>
										<v-col cols="12">
											<TextField
												label="CUIT"
												placeholder="XX-XXXXXXXX-X"
												v-model="invoice.businessIdNumber"
											/>
										</v-col>
										<v-col cols="12">
											<v-radio-group
												v-model="invoice.invoiceType"
												row
												mandatory
												hide-details="auto"
												:error-messages="validation['invoice.invoiceType']"
											>
												<v-radio label="Factura A" value="A" />
												<v-radio label="Factura B" value="B" />
											</v-radio-group>
										</v-col>
									</v-row>
									<v-row v-if="!invoice.business">
										<v-col cols="12" md="6">
											<TextField label="Nombre" v-model="invoice.personFirstname" />
										</v-col>
										<v-col cols="12" md="6">
											<TextField label="Apellido" v-model="invoice.personLastname" />
										</v-col>
										<v-col cols="12">
											<TextField label="DNI" v-model="invoice.personIdNumber" />
										</v-col>
									</v-row>
								</v-card>
							</v-card-text>
							<v-divider class="my-4"></v-divider>
							<v-card-title>Dirección de Facturación</v-card-title>
							<v-card-text>
								<v-row>
									<v-col cols="12">
										<Textarea
											label="Dirección de facturación"
											placeholder="Seleccionar..."
											rows="1"
											auto-grow
											readonly
											no-resize
											v-model="invoiceAddressLine"
											@click="addressDialog = true"
											validator-key="invoiceAddress"
										/>
										<div class="text-right mt-1">
											<v-btn small text @click="addressDialog = true">Seleccionar</v-btn>
										</div>
									</v-col>
								</v-row>
							</v-card-text>
							<v-card-actions class="pt-6">
								<v-spacer></v-spacer>
								<v-btn
									@click="sendPayload({ buyer, invoiceId, invoice, invoiceAddress })"
									x-large
									color="primary"
									:loading="loading"
								>
									Continuar
								</v-btn>
							</v-card-actions>
						</div>
					</CardLayout>
				</Validator>
			</form>
			<AddressDialog
				v-model="addressDialog"
				@addressSelected="invoiceAddress = $event"
				title="Confirmá la dirección de facturación"
			/>
		</template>
	</CheckoutLayout>
</template>

<style></style>
