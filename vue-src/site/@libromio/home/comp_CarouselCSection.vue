<script>
import { Flicking } from '@egjs/vue-flicking'

export default {
	name: 'CarouselCSection',
	components: {
		Flicking: Flicking,
	},
	data() {
		return {
			carouselItems: this.$srv('CarouselC'),
		}
	},
}
</script>

<template>
	<Container fluid class="primary-yellow">
		<Container class="pa-0 pt-13 pb-13">
			<v-row class="mb-5 mt-0">
				<v-col cols="12">
					<div class="text-center primary--text font-6 font-weight-bold">
						¿Qué dicen de nosotros?
					</div>
				</v-col>
				<v-col cols="12">
					<Flicking style="width:100%" :options="{ align: 'prev', bound: true }">
						<div
							v-for="(item, index) in carouselItems"
							:key="`${index}_carousel_item`"
							class="flicking-panel"
						>
							<v-img :src="item.img" width="284" class="mr-3" :aspect-ratio="0.98"></v-img>
						</div>
					</Flicking>
				</v-col>
			</v-row>
		</Container>
	</Container>
</template>

<style scoped>
@import '~@egjs/vue-flicking/dist/flicking.css';

.panel {
	cursor: pointer;
}
</style>
