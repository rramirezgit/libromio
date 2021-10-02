<script>
export default {
	name: 'QtyInput',
	props: {
		qtyModel: {
			type: Number,
			default: 1,
		},
		disabled: Boolean,
		maxQty: Number,
		loading: Boolean,
		metric: {
			type: String,
			default: 'unidad/es',
		},
	},
	model: {
		prop: 'qtyModel',
		event: 'updateQtyModel',
	},
	data() {
		return {
			qty: null,
			qtyInput: null,
		}
	},
	computed: {
		singularMetric() {
			return this.metric.split('/')[0]
		},
		pluralMetric() {
			let spl = this.metric.split('/')
			return `${spl[0]}${spl[1] || ''}`
		},
		metricSuffix() {
			return Math.abs(this.qty) == 1 ? this.singularMetric : this.pluralMetric
		},
	},
	watch: {
		qty(value) {
			this.$emit('updateQtyModel', value)
		},
	},
	methods: {
		addQty() {
			this.setQty(this.qty + 1)
		},
		subtractQty() {
			this.setQty(this.qty - 1)
		},
		setQty(n) {
			let newQty = this.limitQty(n)
			if (newQty === false) newQty = this.limitQty(this.qty)
			this.qty = newQty
			this.qtyInput = `${newQty} ${this.metricSuffix}`
		},
		limitQty(n) {
			if (isNaN(n)) return false
			n = Math.floor(n)
			if (this.maxQty >= 1) {
				n = Math.min(this.maxQty, n)
			}
			return Math.max(1, n)
		},
		onFocus() {
			this.qtyInput = this.qty
		},
		onBlur() {
			this.setQty()
		},
	},
	created() {
		this.setQty(this.qtyModel)
	},
}
</script>

<template>
	<div class="d-flex align-center">
		<v-btn
			@click="subtractQty"
			:ripple="false"
			outlined
			plain
			class="grey--text lighten-1 d-inline rounded-0 qty-btn qty-btn--minus"
			icon
			:disabled="loading || disabled"
		>
			<v-icon>mdi-minus</v-icon>
		</v-btn>
		<v-text-field
			type="tel"
			v-model="qtyInput"
			@change="setQty"
			@focus="onFocus"
			@blur="onBlur"
			hide-details
			outlined
			dense
			small
			class="rounded-0"
			:loading="loading"
			:disabled="disabled"
		/>
		<v-btn
			@click="addQty"
			:ripple="false"
			outlined
			plain
			class="grey--text lighten-1 d-inline rounded-0 qty-btn qty-btn--plus"
			icon
			:disabled="loading || disabled"
		>
			<v-icon>mdi-plus</v-icon>
		</v-btn>
	</div>
</template>

<style scoped>
.v-text-field {
	max-width: 130px !important;
	width: 130px !important;
}
.v-text-field >>> input {
	text-align: center;
	font-size: 1rem;
}

.qty-btn {
	height: 40px !important;
}
.qty-btn--minus {
	border-right: 0;
}
.qty-btn--plus {
	border-left: 0;
}
</style>
