const { createApp } = require('#/express')
const { apiBaseUrl } = require('./index')
const shopApiRouter = require('./api-router')
const shopRouter = require('./router')
const { authMid: userAuthMid } = require('#/user')
const { router: siteRouter } = require('#/site')

const app = createApp()
app.use(userAuthMid.tokenAuth())
app.use(apiBaseUrl, shopApiRouter)
app.use(shopRouter)
app.use(siteRouter)

module.exports = app
