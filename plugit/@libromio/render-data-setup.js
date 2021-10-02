const { RenderData } = require('#/utils')
const { ConfigService } = require('#/admin')

RenderData.addSrv('site', async () => {
	return await ConfigService.getActiveData([
		'SiteNavbarLinks',
		'HomeSliders',
		'HomeFeatured1',
		'HomeFeatured2',
		'NoProducts',
		'HomeBoxesThree',
		'CarouselB',
		'CarouselC',
		'HomeBoxesFourth',
		'HomeFiveBoxes',
		'ExpansionTabs',
	])
})
