exports.__init = () => {
	exports.createApp = require('./create-app')
	exports.db = require('./db')
	exports.KeyValueService = require('./key-value-service')
}
