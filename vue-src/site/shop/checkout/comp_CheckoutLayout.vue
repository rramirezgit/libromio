<script>
import { get } from 'vuex-pathify'

export default {
	name: 'CheckoutLayout',
	metaInfo() {
		return {
			title: `${this.title} | Checkout`,
		}
	},
	props: {
		step: String,
		title: String,
		summaryCta: String,
		payload: Object,
	},
	data() {
		return {
			loadingStep: false,
			loadingFull: false,
			stepData: {},
		}
	},
	computed: {
		order: get('checkout/order'),
		hash: get('route@params.hash'),
		queryEdit: get('route@query.edit'),
		stepSlotData() {
			return {
				...this.stepData,
				order: this.order,
				sendPayload: this.sendPayload.bind(this),
				genStepRoute: this.genStepRoute.bind(this),
				loading: this.loadingFull,
			}
		},
		loadingSummary() {
			return !this.order
		},
		isMobile() {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					return true
				case 'sm':
					return true
				default:
					return false
			}
		},
		isConfirmStep() {
			return this.step == 'confirm'
		},
	},
	methods: {
		updateCheckout(checkout) {
			let { order, empty, missingStep, autoModified } = checkout
			if (empty) {
				this.$router.push({ name: 'home' })
			} else if (missingStep) {
				this.$router.push(this.genStepRoute(missingStep))
			} else {
				if (autoModified) {
					console.log('AUTO_MODIFIED')
				}
				this.$store.set('checkout/order', order)
			}
		},

		initCheckout() {
			this.loadingStep = true
			this.$store.set('checkout/order', null)
			this.$shopApi.get({
				url: '/checkout/init',
				done: ({ success, data }) => {
					this.updateCheckout(data.checkout)
					if (success) {
						let { hash } = data.checkout
						this.$router.replace(this.genStepRoute(data.nextStep, { hash }))
					}
				},
			})
		},

		loadStep() {
			this.$shopApi.get({
				url: `/checkout/step/${this.step}`,
				query: { hash: this.hash },
				loading: (v) => (this.loadingStep = v),
				done: ({ success, data }) => {
					this.updateCheckout(data.checkout)
					if (data.nextStep) {
						return this.$router.replace(this.genStepRoute(data.nextStep))
					}
					if (success) {
						this.assignStepData(data)
						this.$emit('stepLoaded', data)
					}
				},
			})
		},
		sendPayload(payload) {
			payload = payload || this.payload || {}
			this.$shopApi.post({
				url: `/checkout/step/${this.step}`,
				query: { hash: this.hash },
				data: payload,
				loading: (v) => (this.loadingFull = v),
				onValidation: ({ validation }) => {
					this.$emit('payloadValidation', validation)
				},
				done: ({ success, validation, message, data }) => {
					if (data.checkout) this.updateCheckout(data.checkout)
					this.$emit('payloadResponse', { success, validation, message, data })
					if (success && data.nextStep) {
						let nextRoute = this.genStepRoute(data.nextStep)
						if (data.jumpStep) this.$router.replace(nextRoute)
						else this.$router.push(nextRoute)
					}
				},
			})
		},
		genStepRoute(stepKey, opt = {}) {
			let { edit, hash } = opt
			if (!hash) hash = this.hash

			let query = undefined
			if (edit && !this.queryEdit) query = { edit: 1 }
			if (this.queryEdit) stepKey = 'confirm'

			return {
				name: `checkout.${stepKey}`,
				params: { hash },
				query,
			}
		},
		assignStepData(key, value) {
			if (value === undefined) {
				for (let [k, v] of Object.entries(key)) {
					this.assignStepData(k, v)
				}
			} else {
				this.$set(this.stepData, key, value)
			}
		},
		summaryCtaClick() {
			this.sendPayload()
		},
	},
	created() {
		if (this.step) this.loadStep()
		else this.initCheckout()
	},
}
</script>

<template>
	<div class="grey lighten-3 full-height bieen">
		<CheckoutAppbar />
		<Container :fluid="isMobile" class="pt-8 pb-16">
			<v-row>
				<v-col cols="12" md="7" class="pt-5">
					<div class="mb-4" v-if="loadingStep">
						<v-skeleton-loader loading type="heading" />
					</div>
					<div class="text-h4 mb-4" v-else>
						{{ title }}
					</div>
					<v-divider class="mb-4" />
					<div v-if="loadingStep">
						<v-card tile class="mb-4 pa-5">
							<v-skeleton-loader loading type="heading" class="mb-6" />
							<v-skeleton-loader loading type="list-item-avatar" />
							<v-skeleton-loader loading type="list-item-avatar" />
						</v-card>
					</div>
					<slot v-else name="step" v-bind="stepSlotData"></slot>
				</v-col>
				<v-col cols="12" md="5">
					<div v-if="loadingSummary">
						<v-card tile class="mb-4 pa-5">
							<v-skeleton-loader loading type="heading" class="mb-6" />
							<v-skeleton-loader loading type="list-item-avatar@6" />
						</v-card>
					</div>
					<template v-else>
						<OrderSummary v-if="!isMobile || isConfirmStep" :order="order" />
						<OrderSummaryMobile v-else :order="order" />
						<div v-if="summaryCta" class="text-center mt-6">
							<v-btn color="primary" x-large @click="summaryCtaClick" :loading="loadingFull">
								{{ summaryCta }}
							</v-btn>
						</div>
					</template>
				</v-col>
			</v-row>
		</Container>
		<v-overlay :value="loadingFull">
			<v-progress-circular indeterminate size="80" />
		</v-overlay>
	</div>
</template>
<style scoped>
.full-height {
	min-height: 100vh;
}
</style>
