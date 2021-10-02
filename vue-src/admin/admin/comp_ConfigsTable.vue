<script>
import Vue from 'vue'
export default {
	name: 'ConfigsTable',
	data() {
		return {
			search: '',
			expanded: [],
			headers: [
				{ text: 'CONFIGURACIÖN', value: 'name' },
				{ text: '', value: 'actions', sortable: false, align: 'end' },
			],
			configsHeaders: [
				{
					text: 'REFERENCIA',
					value: 'referenceKey',
					sortable: true,
				},
				{ text: 'ESTADO', value: 'status', sortable: false },
				{ text: 'MODIFICADA POR', value: 'updatedby', sortable: false },
				{ text: '', value: 'actions', sortable: false, align: 'end' },
			],
			items: [],
			activeConfig: null,
			activeDef: null,
			loading: false,
			isItemLoading: false,
		}
	},
	computed: {
		itemsPerPage() {
			return this.items.length
		},
	},
	methods: {
		async loadDefinitions() {
			await this.$adminApi.get('/admin/configs-definitions', {
				loading: (v) => (this.loading = v),
				onSuccess: ({ data }) => {
					this.items = Object.values(data.definitions)
					for (let def of this.items) {
						this.$set(def, 'expanded', false)
						this.$set(def, 'configs', [])
						this.$set(def, 'visibles', [])
						def.getFilteredConfigs = () => {
							if (!def.program) return def.configs
							return def.configs.filter((config) => {
								switch (config.status) {
									case 'past':
										return def.visibles.includes(0)
									case 'present':
										return true
									case 'future':
										return def.visibles.includes(1)
								}
							})
						}
						def.canCreateConfig = () => {
							return def.program || def.multiple || def.configs.length == 0
						}
					}
				},
				cache: true,
			})
		},
		async loadConfigs(def) {
			await this.$adminApi.get({
				url: `/admin/configs/${def.keyname}`,
				loading: (v) => {
					this.$set(def, 'loading', v)
					this.isItemLoading = v
				},
				onSuccess: async ({ data }) => {
					def.configs = data.configs
					for (let config of def.configs) {
						this._setupConfigTableData(def, config)
					}
				},
				cache: true,
			})
		},
		setActive(def, config = {}) {
			this.activeDef = def
			this.activeConfig = config
			this.activeConfig.keyname = def.keyname
		},
		async toggleExpanded(item, value) {
			if (this.isItemLoading) return
			let prevItem = this.expanded[0]

			let doExpand
			if (typeof value == 'boolean') doExpand = value
			else doExpand = !prevItem || prevItem.keyname != item.keyname

			if (doExpand) {
				await this.loadConfigs(item, true)
				item.expanded = true
				item.visibles = [1]
				this.expanded = [item]
			} else {
				item.expanded = false
				this.expanded = []
			}
			if (prevItem && prevItem.keyname != item.keyname) {
				prevItem.expanded = false
			}
		},
		_setupConfigTableData(def, config) {
			switch (config.status) {
				case 'past':
					config._table = {
						statusName: 'Inactiva',
						statusClass: { 'grey--text': true },
					}
					break
				case 'future':
					config._table = {
						statusName: 'Programada',
						statusClass: {
							'warning--text': true,
							'font-weight-bold': true,
						},
					}
					break
				case 'present':
				default:
					config._table = {
						statusName: 'Activa',
						statusClass: { 'success--text': true },
					}
					break
			}
			let activationStr = def.program ? `Desde ${Vue.filter('date')(config.fromDate)}` : ''
			if (def.multiple) {
				if (config.toDate) {
					activationStr += ` - hasta ${Vue.filter('date')(config.toDate)}`
				} else {
					activationStr += ' en adelante'
				}
			}

			config._table.activation = activationStr
		},
	},
	created() {
		this.loadDefinitions()
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
			:expanded="expanded"
			item-key="keyname"
			:items-per-page="itemsPerPage"
		>
			<template v-slot:top>
				<v-toolbar flat>
					<v-toolbar-title>Configuraciones</v-toolbar-title>
					<v-divider class="mx-4" inset vertical></v-divider>
					<TextField
						v-model="search"
						append-icon="mdi-magnify"
						label="Buscar..."
						single-line
						dense
						clearable
					/>
				</v-toolbar>
			</template>
			<template v-slot:item.name="{ item }">
				<span
					:class="{
						'font-weight-bold': item.expanded,
						'primary--text': item.expanded,
					}"
				>
					<v-icon v-if="item.expanded" color="primary">
						mdi-chevron-down
					</v-icon>
					{{ item.name }}
				</span>
			</template>

			<template v-slot:item.actions="{ item }">
				<Button color="secondary" small text @click="toggleExpanded(item)" :loading="item.loading">
					<v-icon class="mr-1" v-if="item.expanded">mdi-chevron-up</v-icon>
					<v-icon class="mr-1" v-else>mdi-chevron-down</v-icon>
					Ver configuraciones
				</Button>
			</template>

			<template v-slot:expanded-item="defSlot">
				<td :colspan="defSlot.headers.length">
					<div class="pa-4">
						<v-data-table
							:headers="configsHeaders"
							:items="defSlot.item.getFilteredConfigs()"
							hide-default-footer
						>
							<template v-slot:top>
								<v-toolbar flat>
									<div>
										Configuración
										{{ defSlot.item.multiple ? 'Mútilple' : 'Única' }}
										{{ defSlot.item.program ? ' Programada' : '' }}
										<div class="text--secondary">
											<small v-if="defSlot.item.multiple">
												Múltiples configuraciones pueden estar activas al mismo tiempo
											</small>
											<small v-else>
												Solo una configuración puede estar activa
											</small>
										</div>
									</div>
									<v-spacer />
									<v-btn-toggle v-model="defSlot.item.visibles" multiple v-if="defSlot.item.program">
										<Button
											text
											small
											color="grey"
											:style="{
												'font-size': '0.6rem',
												opacity: defSlot.item.visibles.includes(0) ? 1 : 0.5,
											}"
										>
											Inactivas
										</Button>
										<Button
											text
											small
											color="warning"
											:style="{
												'font-size': '0.6rem',
												opacity: defSlot.item.visibles.includes(1) ? 1 : 0.5,
											}"
										>
											Programadas
										</Button>
									</v-btn-toggle>
								</v-toolbar>
							</template>
							<template v-slot:item.referenceKey="configSlot">
								<div class="d-flex py-2 align-center" v-if="configSlot.item.reference">
									<div v-for="(refitem, i) of configSlot.item.reference" class="px-1" :key="i">
										<small v-if="refitem.type == 'text'" v-html="refitem.value" />
										<v-img
											v-if="refitem.type == 'image'"
											:src="refitem.value"
											:width="refitem.wider ? 140 : 70"
											height="70"
											contain
											style="border: 1px solid #ccc"
											class="rounded"
										/>
									</div>
								</div>
							</template>
							<template v-slot:item.status="configSlot">
								<b :class="configSlot.item._table.statusClass">
									{{ configSlot.item._table.statusName }} </b
								><br />
								<span class="text--secondary">
									{{ configSlot.item._table.activation }}
								</span>
							</template>
							<template v-slot:item.updatedby="configSlot">
								<small>
									{{ configSlot.item.updatedBy }}
									<br />
									{{ configSlot.item.updatedAt | datetime }}
								</small>
							</template>
							<template v-slot:header.actions="">
								<Button
									color="success"
									small
									@click="setActive(defSlot.item)"
									:disabled="!defSlot.item.canCreateConfig()"
								>
									<v-icon>mdi-plus</v-icon>
									Crear
								</Button>
							</template>
							<template v-slot:item.actions="configSlot">
								<Button color="primary" text small @click="setActive(defSlot.item, configSlot.item)">
									<v-icon>mdi-pencil</v-icon>
									Editar
								</Button>
							</template>
						</v-data-table>
					</div>
				</td>
			</template>
		</v-data-table>
		<ConfigsDialog
			v-model="activeConfig"
			:def="activeDef"
			@saved="toggleExpanded(activeDef, true)"
			@deleted="toggleExpanded(activeDef, true)"
		/>
	</div>
</template>
