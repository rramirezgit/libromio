<script>
import { get } from 'vuex-pathify'

export default {
	name: 'AppBar',
	props: {
		showMenu: Boolean,
	},
	data() {
		return {
			searchText: null,
		}
	},
	computed: {
		user: get('shop/user'),
		routeSearch: get('route@query.search'),
		absoluteBtns() {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					return true
				default:
					return false
			}
		},
		order: get('cart/order'),
		orderItemsQty() {
			return this.order?.items.reduce((sum, item) => sum + item.qty, 0)
		},
	},
	watch: {
		routeSearch(value) {
			this.searchText = value
		},
	},
	methods: {
		showLoginDrawer() {
			this.$store.set('shop/loginDrawer', true)
		},
		showCartDrawer() {
			this.$store.set('shop/cartDrawer', true)
		},
		showMenuMobileDrawer() {
			this.$store.set('shop/menuMobileDrawer', true)
		},
		search() {
			let txt = this.searchText ? this.searchText.trim() : ''
			if (txt.length <= 2) return

			this.$router.push({ name: 'shop', params: { filters: ['shop'] }, query: { search: txt } })
		},
	},
}
</script>

<template>
	<v-app-bar height="auto" clipped-right color="white" flat>
		<v-btn
			@click.stop="showMenuMobileDrawer"
			class="d-md-none "
			:absolute="absoluteBtns"
			:top="absoluteBtns"
			:left="absoluteBtns"
			icon
			:ripple="false"
			plain
		>
			<v-icon class="mb-3 mb-sm-0">
				mdi-menu
			</v-icon>
		</v-btn>
		<Container class="pa-0 pt-1 pb-1">
			<v-row>
				<v-col
					cols="12"
					class="d-flex flex-column flex-sm-row justify-center justify-sm-space-between align-center flex-sm-row"
				>
					<router-link :to="{ name: 'home' }">
						<img
							:alt="$srv('BusinessInfo.name')"
							class="shrink mr-30"
							:src="$srv('SiteLogo.logo')"
							:style="
								`${
									absoluteBtns ? 'max-width: 120px' : 'max-width: 150px'
								}; height: auto; max-height: 40px`
							"
						/>
					</router-link>

					<v-tabs
						centered
						class="d-none d-md-flex justify-end"
						active-class="active-menu-item"
						hide-slider
						optional
					>
						<v-tab
							class="primary-dark-purple--text ml-4 font-weight-bold mr-4 menu-item"
							v-for="(linkData, i) of $srv('SiteNavbarLinks')"
							:key="i"
							:to="linkData.link"
							:ripple="false"
						>
							{{ linkData.text }}
						</v-tab>
					</v-tabs>
					<v-form
						:class="`${absoluteBtns && 'full-width form-sm-width'} d-flex form-width`"
						@submit.prevent="search"
					>
						<text-field
							:class="`${absoluteBtns && 'full-width'} search-input`"
							class="pt-0 pb-0"
							type="search"
							autocomplete="off"
							placeholder=""
							append-icon="mdi-magnify"
							outlined
							rounded
							:tile="absoluteBtns"
							solo
							flat
							hide-details
							v-model="searchText"
							@click:append="search"
						/>
					</v-form>
					<div class="d-flex align-center">
						<v-btn
							v-if="user"
							class="d-flex text-h6 font-weight-bold text-lowercase  mr-7 mr-sm-0 mt-1 mt-sm-0"
							text
							:absolute="absoluteBtns"
							:top="absoluteBtns"
							:right="absoluteBtns"
							:to="{ name: 'user.account' }"
							:ripple="false"
							plain
						>
							<v-icon class="mr-8 mb-13 mb-sm-0">
								mdi-account-outline
							</v-icon>
							<span v-if="!absoluteBtns">{{ user.firstname }}</span>
						</v-btn>
						<v-btn
							v-else
							class="d-flex primary-dark-purple--text font-weight-bold mr-7 mr-sm-0 mt-1 mt-sm-0 mb-12 mb-sm-0"
							text
							:absolute="absoluteBtns"
							:top="absoluteBtns"
							:right="absoluteBtns"
							@click.stop="showLoginDrawer"
							:ripple="false"
							plain
						>
							<span class="d-none d-md-block">Mi cuenta</span>
							<v-icon class="d-md-none mb-2 mb-sm-0">
								mdi-account-outline
							</v-icon>
						</v-btn>

						<v-btn
							@click.stop="showCartDrawer"
							:absolute="absoluteBtns"
							:top="absoluteBtns"
							:right="absoluteBtns"
							icon
							class=" mr-sm-4 mr-md-16 primary-dark-purple--text"
							:ripple="false"
							plain
						>
							<v-badge :content="orderItemsQty" :value="!!orderItemsQty" color="error" overlap>
								<v-icon class="mb-3 mb-sm-0">mdi-cart-outline</v-icon>
							</v-badge>
						</v-btn>
					</div>
				</v-col>
			</v-row>
		</Container>
	</v-app-bar>
</template>

<style scoped>
.search-input {
	font-family: 'Playfair Display';
	width: 100%;
}

.full-width {
	width: 100%;
}

.menu-item {
	position: relative;
	min-width: auto;
	border-radius: 30px;
}

.active-menu-item {
	color: #fff !important;
	background-color: #ca6064;
}

.form-width {
	width: 50%;
}

.form-sm-width {
	width: 100%;
}
</style>
