const axios = require('axios')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const { db } = require('#/express')
const { ApiRes, v, makePagination } = require('#/utils')

/**
 * @typedef {{
 * 	search?: string,
 * 	blacklisted?: boolean,
 * 	page?: number,
 * 	itemsPerPage?: number,
 * 	limit?: number,
 * 	pageLinksQty?: number,
 * 	sortDesc?: boolean,
 * 	scope?: string,
 * }} UsersFilters
 */

class UserService {
	/**
	 * @param {UsersFilters} filters
	 * @returns {Promise<{users: Array<{}>, pagination: makePagination.Pagination}>}
	 */
	static async getAll(filters = {}) {
		let filtersBuilder = this.getFiltersRawQueryBuilder(filters)
		let [countRows] = await db
			.$rawQueryBuilder('SELECT')
			.col('COUNT(DISTINCT(sub.id)) AS count')
			.subSelectTable(filtersBuilder, 'sub')
			.run()

		let itemsLength = countRows[0].count
		let pagination = this.makePagination(filters, itemsLength)

		if (!itemsLength) {
			return { users: [], pagination }
		}

		let [idsRows] = await this.getFiltersRawQueryBuilder(filters, true)
			.limit(pagination.offset, pagination.itemsPerPage)
			.run()

		let ids = idsRows.map((row) => row.id)
		let contentScope = filters.scope
		let users = await db.User.scope(contentScope).findAll(
			db
				.$queryBuilder()
				.where({ id: ids })
				.order(db.$fn('FIELD', db.$col('User.id'), ...ids))
				.get()
		)

		return { users, pagination }
	}

	/**
	 * @param {UsersFilters} filters
	 * @param {boolean} applySort
	 */
	static getFiltersRawQueryBuilder(filters = {}, applySort = false) {
		let builder = db
			.$rawQueryBuilder('SELECT')
			.col('User.id')
			.table('User')
			.group('User.id')

		let { blacklisted } = filters
		if (blacklisted !== undefined) {
			builder.where('User.blacklisted = :blacklisted', { blacklisted })
		}

		let { search } = filters
		if (search) {
			let words = search
				.split(' ')
				.filter((word) => !!word)
				.slice(0, 5)

			if (words.length) {
				// prettier-ignore
				let concatCols = [
					'User.firstname', 'User.lastname', 'User.accountEmail', 'User.contactEmail', 
					'User.phonePrefix', 'User.phoneNumber',
				].map(col => `IFNULL(${col}, '')`).join(`,' ',`)

				builder.col(`CONCAT(${concatCols}) AS searchConcat`)
				words.forEach((word, i) => {
					builder.having(`searchConcat LIKE :word${i}`, { [`word${i}`]: `%${word}%` })
				})
			}
		}

		if (applySort) {
			let { sortDesc = true } = filters
			let direction = sortDesc ? 'DESC' : 'ASC'
			builder.order(`User.createdAt ${direction}`)
		}

		return builder
	}

	/**
	 * @param {{page?: number, limit?: number, pageLinksQty?: number}} filters
	 * @param {number} itemsLength
	 * @returns {makePagination.Pagination}
	 */
	static makePagination(filters, itemsLength) {
		let { page, limit, itemsPerPage, pageLinksQty } = filters
		page = isNaN(page) || page < 1 ? null : parseInt(page)
		if (itemsPerPage === undefined) {
			itemsPerPage = isNaN(limit) || limit < 1 ? null : parseInt(limit)
		} else {
			itemsPerPage = isNaN(itemsPerPage) || itemsPerPage < 1 ? null : parseInt(itemsPerPage)
		}

		pageLinksQty = isNaN(pageLinksQty) || pageLinksQty < 1 ? null : parseInt(pageLinksQty)

		return makePagination({
			page,
			itemsPerPage: itemsPerPage || 20,
			pageLinksQty: pageLinksQty || 7,
			itemsLength,
		})
	}

	static async blacklist(userId, blacklisted) {
		if (typeof blacklisted == 'boolean') {
			await db.User.update({ blacklisted }, { where: { id: userId } })
		}
		return ApiRes()
	}

	static async resetPassword(userId, rawPassword) {
		let apiRes = ApiRes()
		let user = await db.User.findByPk(userId)
		if (!user) return apiRes.error('El usuario es inexistente o ha sido eliminado')
		if (rawPassword === true) {
			user.rawPassword = Math.random()
				.toString(36)
				.slice(-8)
		} else {
			let result = await user.setAndValidate({ rawPassword }, { validatePassword: true })
			if (result !== true) return apiRes.validation(result)
		}
		await user.save()
		return apiRes.data({ user, rawPassword: user.rawPassword })
	}

	static get jwtKey() {
		return 'test'
	}

	static get tokenCookieName() {
		return 'user-token'
	}

	static get tokenExpirationDays() {
		return 30
	}

	static async save(data, rulesOptions = {}) {
		let isNew = !data.id
		let apiRes = ApiRes()

		await db.$transaction(async (t) => {
			let user = isNew ? db.User.build() : await db.User.findByPk(data.id)
			if (!user) {
				apiRes.error('El usuario es inexistente o ha sido eliminado')
				throw null
			}

			// VALIDATE USER
			let def = {
				accountEmail: undefined,
				contactEmail: isNew ? data.accountEmail : undefined,
				firstname: undefined,
				lastname: undefined,
				rawPassword: undefined,
				currentPassword: undefined,
				phonePrefix: undefined,
				phoneNumber: undefined,
				googleId: undefined,
				facebookId: undefined,
				addresses: undefined,
			}
			data = _.pickBy(_.defaults(data, def), (v, k) => k in def && (isNew || v !== undefined))
			if (!isNew) delete data.accountEmail
			let results = await user.setAndValidate(data, rulesOptions)
			if (results !== true) {
				apiRes.validation(results, 'user')
				throw null
			}

			// SAVE USER
			await user.save()
			apiRes.data({ user })
		})

		return apiRes
	}

	static _createToken({ accountEmail, id }) {
		return jwt.sign({ accountEmail, id }, this.jwtKey)
	}

	static async validateToken(token) {
		let tokenData = jwt.verify(token, this.jwtKey, { ignoreExpiration: true })
		if (!tokenData) return null
		let user = await db.User.findOne({ where: { id: tokenData.id } })
		if (!user || user.accountEmail !== tokenData.accountEmail || user.blacklisted) return null
		return user
	}

	static async _socialNetworkAuth(
		socialNetwork,
		profileOptions = { socialId, firstName, lastName, email, socialIdColumn },
		res
	) {
		return await db.$transaction(async (t) => {
			let user = await db.User.findOne({
				where: { accountEmail: profileOptions.email },
			})
			if (user) {
				let updateProps = {}
				if (user[profileOptions.socialIdColumn] != profileOptions.socialId)
					updateProps[profileOptions.socialIdColumn] = profileOptions.socialId
				if (!user.firstname) updateProps.firstname = profileOptions.firstName
				if (!user.lastname) updateProps.lastname = profileOptions.lastName
				await user.update(updateProps)
			} else {
				let apiRes = await this.save({
					accountEmail: profileOptions.email,
					firstname: profileOptions.firstName,
					lastname: profileOptions.lastName,
					[profileOptions.socialIdColumn]: profileOptions.socialId,
				})
				if (apiRes.hasErrors()) {
					return ApiRes().error(`No ocurrido un error al validar la cuenta de ${socialNetwork}.`)
				} else {
					user = apiRes.data().user
				}
			}

			const token = this._createToken(user)
			this._saveTokenCookie(res, token)
			return ApiRes().data({ user, token })
		})
	}

	static _saveTokenCookie(res, token) {
		res.cookie(this.tokenCookieName, token, {
			maxAge: this.tokenExpirationDays * 24 * 60 * 60 * 1000,
		})
	}

	static getTokenCookie(req) {
		return req.cookies[this.tokenCookieName]
	}

	static async emailSignup(data, res) {
		let apiRes = await this.save(
			{
				firstname: data.firstname,
				lastname: data.lastname,
				rawPassword: data.rawPassword,
				accountEmail: data.accountEmail,
			},
			{ validateNames: true }
		)
		if (apiRes.hasErrors()) return apiRes

		let { user } = apiRes.data()
		const token = this._createToken(user)
		this._saveTokenCookie(res, token)
		return ApiRes().data({ user })
	}

	static async emailLogin(email, rawPassword, res) {
		let user = null
		if (email && rawPassword) {
			user = await db.User.findOne({ where: { accountEmail: email } })
		}
		if (!user || !user.comparePassword(rawPassword) || user.blacklisted) {
			return ApiRes().error('El usuario o contraseña son incorrectos')
		} else {
			const token = this._createToken(user)
			this._saveTokenCookie(res, token)
			return ApiRes().data({ user })
		}
	}

	static async googleAuth(accessToken, res) {
		return await db.$transaction(async (t) => {
			let data
			try {
				debug(accessToken)
				const result = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
					params: {
						access_token: accessToken,
					},
				})
				data = result.data
			} catch (err) {
				data = null
			}
			if (!data || !data.email) {
				return ApiRes().error('No ocurrido un error al validar la cuenta de google.')
			}
			//check error
			return await this._socialNetworkAuth(
				'Google',
				{
					socialId: data.sub,
					firstName: data.given_name,
					lastName: data.family_name,
					email: data.email,
					socialIdColumn: 'googleId',
				},
				res
			)
		})
	}

	static async facebookAuth(accessToken, facebookId, res) {
		return await db.$transaction(async (t) => {
			let data
			try {
				debug(accessToken)
				const result = await axios.get(`https://graph.facebook.com/v10.0/${facebookId}`, {
					params: {
						access_token: accessToken,
						fields: 'id,first_name,last_name,email',
					},
				})
				data = result.data
			} catch (err) {
				data = null
			}

			if (!data || !data.email) {
				return ApiRes().error('No ocurrido un error al validar la cuenta de facebook.')
			}

			return await this._socialNetworkAuth(
				'Facebook',
				{
					socialId: data.id,
					firstName: data.first_name,
					lastName: data.last_name,
					email: data.email,
					socialIdColumn: 'facebookId',
				},
				res
			)
		})
	}

	static async passwordUpdate(userId, currentPassword, rawPassword, rawPassword2) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			const user = await db.User.findByPk(userId)
			const result1 = await user.setAndValidate({ currentPassword }, { validatePassword: true })
			const result2 = await user.setAndValidate({ rawPassword }, { validatePassword: true })
			apiRes.validation(result1, 'user')
			apiRes.validation(result2, 'user')
			if (rawPassword2 !== undefined) {
				const result3 = await v.validate(rawPassword2, [
					v.required(),
					(value) => value == rawPassword || 'Las contraseñas deben coincidir',
				])
				if (result3 !== true) apiRes.validation('user.rawPassword2', result3)
			}
			if (apiRes.hasErrors()) throw null
			await user.save()
		})
		return apiRes
	}

	static logout(res) {
		res.clearCookie(this.tokenCookieName)
	}
}

module.exports = UserService
