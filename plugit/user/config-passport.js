const { db } = require('#/express')
const { Op } = require('sequelize')
const GoogleStrategy = require('passport-google-oauth20')
const FacebookStrategy = require('passport-facebook')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')

function _getGoogleStrategy() {
	return new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: `${process.env.APP_URL}/login/auth/google/callback`,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				let user = await db.User.findOne({
					where: { google_id: profile.id },
				})

				if (user) {
					done(null, user)
				} else {
					user = await db.User.findOne({
						where: { email: profile._json.email },
					})
					if (user) {
						user.google_id = profile.id
						await user.save()
						done(null, user)
					} else {
						user = await db.User.create({
							name: profile._json.given_name,
							surname: profile._json.family_name,
							email: profile._json.email,
							avatar: profile._json.picture,
							google_id: profile._json.sub,
							contact_email: profile._json.email,
						})

						done(null, user)
					}
				}
			} catch (err) {
				done(err)
			}
		}
	)
}

function _getLocalStrategy() {
	return new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async (email, password, done) => {
			let loggedUser

			if (email && password) {
				try {
					let user = await db.User.findOne({ where: { email } })
					if (user && (await bcrypt.compare(password, user.password))) {
						loggedUser = user
					}
				} catch (err) {
					done(err)
				}
			}

			if (loggedUser) {
				done(null, loggedUser)
			} else {
				done(null, null, { message: 'Wrong credentials' })
			}
		}
	)
}

module.exports = (passport) => {
	// Google Sign Up - Login
	if (process.env.GOOGLE_CLIENT_ID) {
		passport.use(_getGoogleStrategy())
	}

	// Local Sign Up - Login
	passport.use('user', _getLocalStrategy())
}
