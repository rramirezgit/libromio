<script>
import addressHelperMixin from '@/__shared/shop/mixin_address-helper.js'

export default {
	name: 'AddressDialog',
	mixins: [addressHelperMixin],
	props: {
		dialog: Boolean,
		title: String,
	},
	model: {
		prop: 'dialog',
		event: 'updateDialog',
	},
	data() {
		return {
			loading: false,
			loadingActions: false,
			loadingZipcode: false,
			address: {},
			validation: {},
			selectedAddress: null,
			addresses: [],
			addressForm: false,
		}
	},
	watch: {
		dialog(value) {
			if (value) this.loadAddresses()
		},
	},
	computed: {
		dialogWidth() {
			if (this.loading) return 500
			if (this.addressForm && this.address.zipcodeId) return 900
			return 700
		},
		dialogTitle() {
			if (this.addressForm) {
				if (this.address.zipcodeId) {
					return this.address.id ? 'Modificar dirección' : 'Ingresá la dirección'
				} else {
					return 'Ingresá el Código Postal'
				}
			} else {
				return this.title || 'Seleccioná la dirección'
			}
		},
	},
	methods: {
		accept() {
			if (this.addressForm) {
				if (this.address.zipcodeId) this.saveAddress()
				else this.searchZipcode()
			} else {
				this.$emit('addressSelected', this.selectedAddress)
				this.closeDialog()
			}
		},
		cancel() {
			if (this.addressForm && this.addresses.length) {
				this.addressForm = false
			} else {
				this.closeDialog()
			}
		},
		closeDialog() {
			this.$emit('updateDialog', false)
		},
		selectAddress(address) {
			this.$emit('addressSelected', address)
			this.closeDialog()
		},
		showForm(editAddress) {
			this.addressForm = true
			if (editAddress) {
				this.address = {
					...editAddress,
					zipcodeInput: editAddress.zipcode.code,
					stateName: editAddress.zipcode.state.name,
					countryName: editAddress.zipcode.state.country.name,
				}
			} else {
				this.address = {}
				this.editZipcode()
			}
		},
		async loadAddresses(withLoader = true) {
			await this.$shopApi.get({
				url: '/user/addresses',
				loading: (v) => (this.loading = withLoader ? v : false),
				onSuccess: ({ data }) => {
					this.addresses = data.addresses || []
				},
			})
			if (this.addresses.length) {
				this.selectedAddress = this.addresses[0]
				this.addressForm = false
			} else {
				this.showForm()
			}
		},
		saveAddress() {
			let isNew = !this.address.id
			let options = {
				data: this.address,
				loading: (v) => (this.loadingActions = v),
				onValidation: ({ validation }) => (this.validation = validation),
				onSuccess: async () => {
					this.addressForm = false
					await this.loadAddresses()
				},
			}
			if (isNew) this.$shopApi.post('/user/address', options)
			else this.$shopApi.put(`/user/address/${this.address.id}`, options)
		},
		/*deleteAddress(address) {
			this.$shopApi.delete(`/user/address/${address.id}`, {
				loading: (v) => this.$set(address, 'loadingDelete', v),
				onSuccess: async () => {
					await this.loadAddresses(false)
				},
			})
		},*/
		editZipcode() {
			this.address.zipcodeInput = ''
			this.setZipcodeId(null)
			this.$nextTick(() => {
				this.$refs.zipcodeTextField.focus()
			})
		},
		setZipcodeId(value) {
			this.$set(this.address, 'zipcodeId', value)
		},
		searchZipcode() {
			this.$shopApi.get({
				url: `/user/zipcode/${this.address.zipcodeInput}`,
				loading: (v) => {
					this.loadingActions = this.loadingZipcode = v
				},
				onValidation: ({ validation }) => (this.validation = validation),
				onSuccess: ({ data }) => {
					this.setZipcodeId(data.zipcode.id)
					this.address.stateName = data.zipcode.state.name
					this.address.countryName = data.zipcode.state.country.name
				},
			})
		},
	},
}
</script>

<template>
	<v-dialog
		:value="dialog"
		:max-width="dialogWidth + 'px'"
		class="pb-6"
		persistent
		scrollable
		v-bind="$attrs"
	>
		<v-card v-if="loading" class="py-4">
			<v-card-title>
				<v-progress-circular indeterminate size="30" class="mr-4" />
				Cargando tus direcciones
			</v-card-title>
		</v-card>
		<v-card v-else>
			<v-card-title>
				{{ dialogTitle }}
			</v-card-title>
			<v-card-text style="max-height: 1000px" v-if="!addressForm">
				<v-radio-group v-model="selectedAddress">
					<v-radio v-for="address in addresses" :key="address.id" :value="address" class="py-3">
						<template #label>
							{{ getAddressLine(address) }}
							<v-spacer />
							<v-btn color="primary" small @click="showForm(address)" class="ml-2">Editar</v-btn>
							<!-- <v-btn
								color="error"
								text
								small
								@click.stop.prevent="deleteAddress(address)"
								class="ml-2"
								:loading="address.loadingDelete"
							>
								<v-icon>mdi-delete</v-icon>
							</v-btn> -->
						</template>
					</v-radio>
				</v-radio-group>
			</v-card-text>
			<v-card-text style="max-height: 1000px" class="pt-4" v-if="addressForm">
				<Validator :validation="validation">
					<div>
						<v-row>
							<v-col cols="12">
								<TextField
									ref="zipcodeTextField"
									label="Código Postal"
									v-model="address.zipcodeInput"
									:loading="loadingZipcode"
									:readonly="!!address.zipcodeId"
									style="width: 320px"
									validator-key="zipcode"
								>
									<template #append-outer>
										<v-btn color="primary" small text v-if="address.zipcodeId" @click="editZipcode">
											<v-icon small class="mr-1">mdi-pencil</v-icon> Modificar
										</v-btn>
									</template>
								</TextField>
							</v-col>
						</v-row>
						<v-row v-if="address.zipcodeId">
							<v-col cols="6" md="4">
								<TextField label="País" readonly :value="address.countryName" />
							</v-col>
							<v-col cols="6" md="4">
								<TextField label="Provincia" readonly :value="address.stateName" />
							</v-col>
							<v-col cols="12" md="4">
								<TextField label="Localidad" v-model="address.city" />
							</v-col>
							<v-col cols="12" md="6">
								<TextField label="Calle" v-model="address.street" />
							</v-col>
							<v-col cols="12" md="2">
								<TextField label="Altura" v-model="address.streetNumber" />
							</v-col>
							<v-col cols="6" md="2">
								<TextField label="Piso" v-model="address.floor" />
							</v-col>
							<v-col cols="6" md="2">
								<TextField label="Departamento" v-model="address.apartment" />
							</v-col>
							<v-col cols="12" md="6">
								<TextField label="Entrecalle 1" v-model="address.intersection1" />
							</v-col>
							<v-col cols="12" md="6">
								<TextField label="Entrecalle 2" v-model="address.intersection2" />
							</v-col>
							<v-col cols="12">
								<TextField label="Comentarios / Instrucciones" v-model="address.comment" />
							</v-col>
						</v-row>
					</div>
				</Validator>
			</v-card-text>
			<v-card-actions class="flex-wrap">
				<v-btn small color="primary" @click="showForm()" class="mb-3 mb-sm-0" v-if="!addressForm">
					<v-icon>mdi-plus</v-icon> Nueva dirección
				</v-btn>
				<v-spacer></v-spacer>
				<v-btn text @click="cancel" class="mb-3 mb-sm-0" :disabled="loadingActions">
					Cancelar
				</v-btn>
				<v-btn color="success" @click="accept" class="mb-3 mb-sm-0" :loading="loadingActions">
					{{ addressForm ? 'Aceptar' : 'Seleccionar' }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
