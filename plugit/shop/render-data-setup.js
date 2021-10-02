const { RenderData } = require('#/utils')
const UserWishlistService = require('./services/user-wishlist-service')
const { ConfigService } = require('#/admin')

RenderData.addSrv('site', async () => {
	return await ConfigService.getActiveData(['SocialLogin', 'BusinessInfo', 'SiteLogo'])
})

RenderData.addSrv('site', async (req) => {
	let user = req.user?.serialize('account')
	return { user }
})

RenderData.addSrv('site', async (req) => {
	let wishlistIds = req.user ? await UserWishlistService.getProductsIds(req.user.id) : []
	return { wishlistIds }
})
