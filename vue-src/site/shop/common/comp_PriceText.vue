<script>
export default {
	name: 'PriceText',

	props: {
		currency: {
			type: String,
			default: '$',
		},
		amount: Number,
		supDecimals: {
			type: Boolean,
			default: true,
		},
		zeroDecimals: {
			type: Boolean,
			default: false,
		},
		thousandsSep: {
			type: String,
			default: '.',
		},
	},
	computed: {
		absAmount() {
			return Math.abs(this.amount)
		},
		negative() {
			return this.amount < 0
		},
		intNum() {
			return Math.floor(this.absAmount)
		},
		intStr() {
			let numStr = this.intNum.toString()
			let str = ''
			let c = 0
			for (var i = numStr.length - 1; i >= 0; i--) {
				if (c && c % 3 == 0) str = `${this.thousandsSep}${str}`
				str = `${numStr[i]}${str}`
				c++
			}
			return str
		},
		decimalsNum() {
			return Math.min(99, Math.round((this.absAmount - this.intNum) * 100))
		},
		decimalsStr() {
			if (!this.decimalsNum && !this.zeroDecimals) return ''
			if (this.decimalsNum < 10) return `0${this.decimalsNum}`
			return `${this.decimalsNum}`
		},
	},
}
</script>

<template>
	<span class="text-no-wrap">
		{{ negative ? '-' : '' }}{{ currency }} {{ intStr
		}}{{ decimalsStr && !supDecimals ? `,${decimalsStr}` : ''
		}}<sup v-if="decimalsStr && supDecimals">{{ decimalsStr }}</sup>
	</span>
</template>

<style scoped>
span {
	line-height: 1;
}
sup {
	top: -0.5em;
	font-size: 60%;
	opacity: 0.9;
	position: relative;
	margin-left: 1px;
}
</style>
