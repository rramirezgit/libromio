<script>
import { Flicking } from '@egjs/vue-flicking'

export default {
	name: 'CarouselBSection',
	components: {
		Flicking: Flicking,
	},
	data() {
		return {
			carouselItems: this.$srv('CarouselB'),
		}
	},
}
</script>

<template>
	<Container fluid class="primary">
		<Container class="pa-0 pb-16 pt-16">
			<v-row class="mb-5 mt-0">
				<v-col cols="12">
					<div class="text-center white--text font-6 font-weight-bold">
						¿Cómo personalizo mi cuento?
					</div>
				</v-col>
				<v-col cols="12">
					<Flicking style="width:100%" :options="{ align: 'prev', bound: true }">
						<div
							v-for="(item, index) in carouselItems"
							:key="`${index}_carousel_item`"
							class="flicking-panel"
							style="width:100%"
						>
							<v-img :src="item.img" style="max-width:100%" :aspect-ratio="4.13"></v-img>
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
