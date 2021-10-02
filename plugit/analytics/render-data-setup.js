const { RenderData } = require('#/utils')
const { ConfigService } = require('#/admin')

RenderData.addSrv('site', async () => {
	return await ConfigService.getActiveData(['Analytics'])
})

RenderData.add('site', async () => {
	return await ConfigService.getActiveData(['Analytics'])
})
