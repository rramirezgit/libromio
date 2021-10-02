const { ConfigService } = require('#/admin')

ConfigService.define('SocialLogin', {
	name: 'Usuario/Login con Redes Sociales',
	fields: {
		googleClientId: {
			type: 'string',
			label: 'Google - Client Id',
		},
		facebookAppId: {
			type: 'string',
			label: 'Facebook - App Id',
		},
	},
	dataRules: () => ({}),
	reference: (instance) => {
		let str = []
		let { googleClientId, facebookAppId } = instance.data
		if (googleClientId) str.push('Google')
		if (facebookAppId) str.push('Facebook')
		return [{ type: 'text', value: str.join(' / ') }]
	},
})
