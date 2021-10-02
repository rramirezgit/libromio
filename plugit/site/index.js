exports.__init = () => {
	require('./admin-configs-definitions')
	require('./render-data-setup')
	exports.router = require('./router')
}
