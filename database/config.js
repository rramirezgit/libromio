const options = {
	username: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	host: process.env.DATABASE_SERVER,
	port: process.env.DATABASE_PORT,
	dialect: 'mysql',
	dialectOptions: {
		timezone: process.env.TZ_DIFF,
		decimalNumbers: true,
	},
	logging: false,
	timezone: process.env.TZ_DIFF,
}

module.exports = {
	development: options,
	test: options,
	production: options,
}
