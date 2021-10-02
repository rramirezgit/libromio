const { basename, join } = require('path')
const moment = require('moment')
const { db } = require('#/express')
const { MailerBuilder } = require('#/mailer')
const { ConfigService, mailerConfigCreator } = require('#/admin')
const { format } = require('#/utils')

mailerConfigCreator('users', 'Emails Usuarios')

MailerBuilder.register('users.layout', {
	build: async (mailer, { user }) => {
		let businessInfo = await ConfigService.getActiveData('BusinessInfo')
		let siteLogo = await ConfigService.getActiveData('SiteLogo')

		mailer
			.transportKey('users')
			.to(user.contactEmail)
			.bcc(user.accountEmail)
			.renderData({
				siteName: businessInfo?.name || 'Drubbishop',
				user,
				format,
			})
		if (siteLogo?.logo) {
			let { logo } = siteLogo
			mailer.attach({ filename: basename(logo), path: join('public', logo), cid: 'users.layout.logo' })
		}
	},
	serialize: async ({ user }) => {
		return { userId: user.id }
	},
	unserialize: async ({ userId }) => {
		let user = await db.User.findByPk(userId)
		return { user }
	},
})

MailerBuilder.register('users.reset-pass', {
	use: ['users.layout'],
	build: async (mailer, { password }) => {
		mailer.subject('Reestablecimos tu contraseña').render('shop/users-reset-pass').renderData({ password })
	},
	serialize: ['password'],
})
