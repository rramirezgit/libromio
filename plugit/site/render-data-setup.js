const { RenderData } = require('#/utils')
const { ConfigService } = require('#/admin')

RenderData.add('site', async () => {
	return await ConfigService.getActiveData(['SiteFavicon', 'SiteScripts'])
})
