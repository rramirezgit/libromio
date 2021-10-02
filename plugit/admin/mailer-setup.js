const moment = require('moment')
const { basename, join } = require('path')
const { adminBaseUrl } = require('./index')
const { MailerBuilder } = require('#/mailer')
const ConfigService = require('./services/config-service')
const mailerConfigCreator = require('./mailer-config-creator')
const { format } = require('#/utils')

mailerConfigCreator('admins', 'Emails Administradores')

MailerBuilder.register('admins.layout', {
	build: async (mailer) => {
		let AdminTheme = await ConfigService.getActiveData('AdminTheme')

		mailer.transportKey('admins').renderData({
			adminBaseUrl,
			format,
		})

		if (AdminTheme?.logo) {
			let { logo } = AdminTheme
			mailer.attach({ filename: basename(logo), path: join('public', logo), cid: 'admins.layout.logo' })
		}
	},
})

MailerBuilder.register('admins.reset-pass', {
	use: ['admins.layout'],
	build: async (mailer, { password }) => {
		mailer
			.subject('Reestablecimos tu contraseña de administrador')
			.render('admin/admins-reset-pass')
			.renderData({ password })
	},
	serialize: ['password'],
})
