<script>
import fiscalImage from './asset_fiscal.png'

export default {
	name: 'Footer',
	data() {
		return {
			categorys: [
				{ name: 'HOME', to: { name: 'home' } },
				{ name: 'TIENDA', to: { name: 'shop', params: { filters: ['shop'] } } },
				{ name: 'CONTACTO', to: { name: 'us' } },
				{ name: 'TÉRMINOS Y CONDICIONES', to: { name: 'howto' } },
				{ name: 'MEDIOS DE PAGO', to: { name: 'paymentsInfo' } },
			],
			fiscalImage,
			logo: this.$srv('SiteLogo.logoWhite'),
			businessInfo: this.$srv('BusinessInfo', {}),
		}
	},
}
</script>

<template>
	<v-footer padless class="primary-dark-purple white--text text-center pt-14 pb-2 mt-16">
		<Container class="pa-0">
			<v-row class="footer-content">
				<v-col cols="12" sm="3" class="d-flex flex-column d-sm-block align-center align-sm-start">
					<div class="d-flex justify-start">
						<img :src="logo" style="max-height: 88px; width: auto" contain class="mb-3 mb-sm-6" />
					</div>
					<a v-if="businessInfo.afipLink" :href="businessInfo.afipLink" target="_black">
						<v-img :src="fiscalImage" max-width="60" contain />
					</a>
				</v-col>
				<v-col cols="12" sm="3" class="text-center text-sm-left mt-8 mt-sm-0">
					<div class="pb-2 pb-sm-8 font-weight-bold primary-yellow--text">
						CATEGORÍAS
					</div>
					<div v-for="category in categorys" :key="category.name" class="pa-1 pl-0 text-subtitle-2">
						<router-link class="text-decoration-none" :to="category.to">
							<div class="secondary--text">
								{{ category.name }}
							</div>
						</router-link>
					</div>
				</v-col>
				<v-col cols="12" sm="3" class="text-center text-sm-left">
					<div class="pb-2 pb-sm-8 font-weight-bold primary-yellow--text ">
						TIENDA
					</div>
					<div v-for="category in categorys" :key="category.name" class="pa-1 pl-0 text-subtitle-2">
						<router-link class="text-decoration-none" :to="category.to">
							<div class="secondary--text">
								{{ category.name }}
							</div>
						</router-link>
					</div>
				</v-col>
				<v-col cols="12" sm="3" class="text-center text-sm-left">
					<div class="pb-2 pb-sm-8 font-weight-bold primary-yellow--text">
						CONTACTANOS
					</div>

					<a v-if="businessInfo.whatsapp" class="link-item">
						<v-icon>mdi-whatsapp</v-icon> {{ businessInfo.whatsapp }}
					</a>
					<a v-if="businessInfo.phone" class="link-item" :href="`tel:${businessInfo.phone}`">
						<v-icon>mdi-phone</v-icon> {{ businessInfo.phone }}
					</a>
					<a v-if="businessInfo.email" class="link-item" :href="`mailto:${businessInfo.email}`">
						<v-icon>mdi-email-multiple-outline</v-icon> {{ businessInfo.email }}
					</a>
					<div class="d-flex mt-5 justify-center justify-sm-start">
						<div>
							<a
								v-if="businessInfo.facebook"
								class="link-item"
								:href="businessInfo.facebook"
								target="_blank"
							>
								<v-btn fab small class="primary-yellow">
									<v-icon class="mr-0 primary--text">mdi-facebook</v-icon>
								</v-btn>
							</a>
						</div>
						<div class="ml-2">
							<a
								v-if="businessInfo.instagram"
								class="link-item"
								:href="businessInfo.instagram"
								target="_blank"
							>
								<v-btn fab small class="primary-yellow">
									<v-icon class="mr-0 primary--text">mdi-instagram</v-icon>
								</v-btn>
							</a>
						</div>
					</div>
				</v-col>
				<v-col cols="12" class="text-center text-lg-left pt-14 text-caption">
					© {{ new Date().getFullYear() }} Libro Mío. Todos los derechos reservados.
				</v-col>
			</v-row>
			<div class="bubble primary-dark-purple" style="left:calc(50% - 779px)"></div>
			<div class="bubble primary-dark-purple below-bubble" style="left:calc(50% - 609px);"></div>
			<div class="bubble primary-dark-purple" style="left:calc(50% - 409px);"></div>
			<div class="bubble primary-dark-purple below-bubble" style="left:calc(50% - 209px);"></div>
			<div class="bubble primary-dark-purple" style="left:calc(50% - 10px);"></div>
			<div class="bubble primary-dark-purple below-bubble" style="left:calc(50% + 160px);"></div>
			<div class="bubble primary-dark-purple" style="left:calc(50% + 350px);"></div>
			<div class="bubble primary-dark-purple below-bubble" style="left:calc(50% + 550px);"></div>
		</Container>
	</v-footer>
</template>

<style scoped>
.link-item {
	padding: 6px 0;
	color: white;
}
a.link-item {
	display: block;
	text-decoration: none;
}
.link-item >>> .v-icon {
	margin-right: 4px;
	color: white;
}

.footer-content {
	z-index: 1;
	position: relative;
}

.bubble {
	width: 300px;
	height: 300px;
	border-radius: 50%;
	position: absolute;
	top: -80px;
	left: 0;
	z-index: 0;
}

.below-bubble {
	top: -40px;
}
</style>
