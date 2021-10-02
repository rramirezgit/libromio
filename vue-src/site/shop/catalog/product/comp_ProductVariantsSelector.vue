<script>
export default {
	props: {
		product: Object,
		selectedVariantId: String,
	},
	model: {
		prop: 'selectedVariantId',
		event: 'updateModel',
	},
	data() {
		return {
			allVariants: {},
			models: {},
		}
	},
	methods: {
		processVariants() {
			let variants = [...this.product.variants]
			variants.sort((a, b) => a.position - b.position)
			let { vAttrsPos } = this.product
			for (let variant of variants) {
				let parentValue
				let tempValName = ''
				let tempKeyName = ''
				if (vAttrsPos) {
					variant.attrs.sort((a, b) => vAttrsPos.indexOf(a.attrKey.k) - vAttrsPos.indexOf(b.attrKey.k))
				}
				for (let i = 0; i < variant.attrs.length; i++) {
					let keyName = variant.attrs[i].attrKey.k
					let valueName = variant.attrs[i].v
					if (i == 0) {
						this.checkCreateArray(this.allVariants, keyName)
						this.checkCreateArray(this.allVariants[keyName], [valueName])
						parentValue = this.allVariants[keyName][valueName]
						tempValName = valueName
						tempKeyName = keyName
					} else {
						this.checkCreateArray(parentValue, keyName, true)
						parentValue[keyName].push(valueName)
						tempValName = `${tempValName}_${valueName}`
						tempKeyName = `${tempKeyName}_${keyName}`
					}
				}
				//esto es para comparar una vez está seleccionada una variante
				variant.valName = tempValName
				variant.keyName = tempKeyName
			}
		},
		checkCreateArray(object, variant, isArray) {
			if (!object[variant] || (isArray && !Array.isArray(object[variant]))) {
				object[variant] = isArray ? [] : {}
			}
		},
		setVariant(variantId) {
			let variant = variantId && this.product.variants.find((variant) => variant.id == variantId)
			if (!variant) variant = this.product.variants.find((variant) => variant.main)
			if (!variant) variant = this.product.variants[0]

			let defaultKey = variant.keyName.split('_')
			let defaultVal = variant.valName.split('_')

			for (let i = 0; i < defaultKey.length; i++) {
				this.$set(this.models, `${defaultKey[i]}_model`, defaultVal[i])
			}
			this.$emit('updateModel', variant.id)
		},

		onSelectionChange() {
			let selectedValues = []
			for (let item in this.models) {
				selectedValues.push(this.models[item])
			}
			selectedValues = selectedValues.join('_')
			let variant = this.product.variants.find((element) => element.valName == selectedValues)
			this.setVariant(variant.id)
		},

		removeDuplicates(ary) {
			return [...new Set(ary)]
		},
	},
	created() {
		this.processVariants()
		this.setVariant(this.selectedVariantId)
	},
}
</script>

<template>
	<div>
		<div v-for="(variant, key) in allVariants" :key="key">
			<div class="pb-1 font-weight-bold text-uppercase">
				{{ key }}
			</div>
			<v-select
				v-if="Object.keys(variant).length > 5"
				@change="onSelectionChange"
				v-model="models[`${key}_model`]"
				:items="Object.keys(variant)"
				dense
				outlined
			/>
			<v-btn-toggle
				v-else
				v-model="models[`${key}_model`]"
				@change="onSelectionChange"
				group
				dense
				class="mb-4"
				mandatory
			>
				<v-btn v-for="name in Object.keys(variant)" :key="name" :value="name">
					{{ name }}
				</v-btn>
			</v-btn-toggle>

			<div
				v-for="(variant_name, key_name) in variant[models[`${key}_model`]]"
				:key="`${key_name}_${variant_name}`"
			>
				<div class="pb-1 font-weight-bold text-uppercase">
					{{ key_name }}
				</div>
				<v-select
					@change="onSelectionChange"
					v-model="models[`${key_name}_model`]"
					v-if="removeDuplicates(variant_name).length > 5"
					:items="variant_name"
					dense
					outlined
				/>
				<v-btn-toggle
					v-else
					v-model="models[`${key_name}_model`]"
					@change="onSelectionChange"
					group
					dense
					class="mb-4"
					mandatory
				>
					<v-btn v-for="name_d in removeDuplicates(variant_name)" :key="name_d" :value="name_d">
						{{ name_d }}
					</v-btn>
				</v-btn-toggle>
			</div>
		</div>
		<!-- <v-alert v-if="errorMessage" prominent type="error">
			<v-row align="center">
				<v-col class="grow">
					{{ errorMessage }}
				</v-col>
			</v-row>
		</v-alert> -->
	</div>
</template>
