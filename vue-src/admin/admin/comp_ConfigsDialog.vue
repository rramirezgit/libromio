<script>
import itemDialogMixin from '@/admin/admin/mixin_item-dialog'
export default {
	name: 'ConfigsDialog',
	mixins: [itemDialogMixin('config')],
	props: {
		def: Object,
	},
	methods: {
		setDefaults() {
			this.$set(this.config, 'data', this.config.data || {})
			this.$set(this.config, 'files', {})
			if (this.isNew) {
				for (let field of this.def.fields) {
					this.$set(this.config.data, field.key, field.defaultValue)
				}
			}
		},
		getComponentAttrs(field) {
			let instanceAttrs = this.config.componentAttrs && this.config.componentAttrs[field.key]
			return {
				...field.componentAttrs,
				...(instanceAttrs || {}),
			}
		},
		saveConfig() {
			this.loading = true
			setTimeout(() => {
				let data = { config: { ...this.config } }
				let files = data.config.files
				delete data.config.files

				let opts = {
					loading: (v) => (this.loading = v),
					onValidation: ({ validation }) => (this.validation = validation),
					data,
					files,
					successMessage: {
						title: 'Listo!',
						text: `La configuración se ha ${this.isNew ? 'creado' : 'guardado'} correctamente`,
					},
					onSuccess: ({ data }) => {
						this.$emit('saved', data.configId)
						this.dialog = false
					},
					clearCache: `/admin/configs/${this.config.keyname}`,
				}

				if (this.isNew) {
					this.$adminApi.post('/admin/configs', opts)
				} else {
					this.$adminApi.put(`/admin/configs/${this.config.id}`, opts)
				}
			}, 500)
		},
		deleteConfig() {
			let opts = {
				loading: (v) => (this.loadingDelete = v),
				confirm: {
					title: `La Configuración será eliminada`,
					text: `¿Desea continuar?`,
					accept: 'Sí, eliminar',
				},
				onSuccess: () => {
					this.$emit('deleted', this.config.id)
					this.dialog = false
				},
				clearCache: `/admin/configs/${this.config.keyname}`,
			}
			this.$adminApi.delete(`/admin/configs/${this.config.id}`, opts)
		},
	},
	watch: {
		dialog(value) {
			if (value) this.setDefaults()
		},
	},
}
</script>

<template>
	<ItemDialog
		v-if="def"
		v-model="dialog"
		:title-text="`${def.name} - ${isNew ? 'Crear' : 'Editar'} configuración`"
		:submit-text="isNew ? 'Crear' : 'Guardar'"
		:loading="loading"
		:deletable="!isNew && def.canCreateConfig()"
		@delete="deleteConfig"
		:loading-delete="loadingDelete"
		@submit="saveConfig"
	>
		<Validator :validation="validation">
			<cont>
				<row v-if="def.program">
					<c><Subtitle text="Programación"/></c>
					<c md="6">
						<DatePickerDialog
							v-model="config.fromDate"
							label="Activa desde"
							hint="Campo obligatorio"
							persistent-hint
							dense
						/>
					</c>
					<c v-if="def.multiple" md="6">
						<DatePickerDialog
							v-model="config.toDate"
							label="Activa hasta"
							hint="Dejar vacío para no definir un límite de fecha"
							persistent-hint
							dense
						/>
					</c>
				</row>
				<row>
					<c><Subtitle text="Configuración"/></c>
					<c v-for="field of def.fields" :key="field.key" :md="field.columns || 12">
						<DynamicField
							v-model="config[field.fileKey ? 'files' : 'data'][field.fileKey || field.key]"
							:field-type="field.type"
							:component-name="field.componentName"
							:component-attrs="getComponentAttrs(field)"
							:label="field.label"
							:validator-key="
								field.fileKey ? `config.files.${field.fileKey}` : `config.data.${field.key}`
							"
						/>
					</c>
				</row>
			</cont>
		</Validator>
	</ItemDialog>
</template>
