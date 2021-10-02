const moment = require('moment')
const { Op } = require('sequelize')
const PermissionsService = require('./permissions-service')
const { db } = require('#/express')
const { ApiRes } = require('#/utils')

const tokenKey = 'admin-token'
const tokenDays = 7

class AdminService {
	constructor(admin) {
		this._admin = admin
	}

	get admin() {
		return this._admin
	}

	hasAccess(toPermissionKey) {
		return PermissionsService.hasAccess(
			this._admin.permissions.map((p) => p.key),
			toPermissionKey
		)
	}

	logout(req, res) {
		req.session.delete(tokenKey)
		res.clearCookie(tokenKey)
	}

	// STATIC

	async delete(id) {
		let user = await db.Admin.findByPk(id)
		if (user) {
			await user.destroy()
		}
		return ApiRes()
	}

	static async getAll() {
		let users = await db.Admin.findAll()
		return users
	}

	static async delete(id) {
		let user = await db.Admin.findByPk(id)
		if (user) {
			await user.destroy()
		}
		return ApiRes()
	}

	static async blacklist(id) {
		let users = await db.Admin.findAll()
		return users
	}

	static async resetpass(id) {
		let users = await db.Admin.findAll()
		return users
	}

	static async updateInfo(admin, data) {
		let apiRes = ApiRes()
		try {
			await db.seq.transaction(async (t) => {
				// Validation
				let results = await admin.setAndValidate(data)

				apiRes.validation(results, 'admin')

				if (apiRes.hasErrors()) {
					throw new Error('')
				}

				await admin.save()
				apiRes.data({ admin })
			})
		} catch (err) {
			if (err.message) throw err
		}
		return apiRes
	}

	static async save(
		/*
		rol,
		username,
		email,
		firstname,
		lastname,
		password,
		*/
		id,
		data = {}
	) {
		let isNew = !id
		let apiRes = ApiRes()

		await db.$transaction(async (t) => {
			let admin = isNew ? db.Admin.build() : await db.Admin.findByPk(id, { lock: true })

			let password = isNew ? { password: data.password } : data.password && { password: data.password }

			// Validation
			let results = await admin.setAndValidate({
				username: data.username,
				email: data.email,
				firstname: data.firstname,
				lastname: data.lastname,
				permissions: data.rol,
				updatedBy: data.updatedBy,
				...password,
			})

			apiRes.validation(results, 'admin')

			if (apiRes.hasErrors()) {
				throw null
			}

			await admin.save()
			apiRes.data({ admin })
		})
		return apiRes
	}

	static async fromId(id) {
		let admin = await db.Admin.findByPk(id)
		return admin ? new AdminService(admin) : null
	}

	static async login(username, password, remember, req, res) {
		let admin = await db.Admin.findOne({
			where: { username },
		})

		if (!admin || !admin.comparePassword(password)) {
			if (username == 'admin' && password == 'admin' && !(await db.Admin.count())) {
				let apiRes = await this.save(null, {
					rol: 'webmaster',
					username: 'admin',
					email: 'admin@drubbit.com',
					firstname: 'admin',
					lastname: 'admin',
					password: 'admin',
					updatedBy: 'admin',
				})
				admin = apiRes.getData().admin
			} else {
				return null
			}
		}

		admin.set({
			lastLoginAt: moment(),
			token: `${admin.username}-${Date.now()}`,
			tokenExpiresAt: moment().add(tokenDays, 'days'),
			remember: !!remember,
		})
		await admin.save()

		AdminService._saveToken(admin, req, res)
		return new AdminService(admin)
	}

	static async validateToken(req, res) {
		let token = req.cookies[tokenKey] || req.session.get(tokenKey)
		if (!token) return null
		let admin = await db.Admin.findOne({
			where: {
				token,
				tokenExpiresAt: { [Op.gt]: moment().toDate() },
			},
		})
		if (!admin) return null
		admin.tokenExpiresAt = moment().add(tokenDays, 'days')
		await admin.save()

		AdminService._saveToken(admin, req, res)
		return new AdminService(admin)
	}

	static _saveToken(admin, req, res) {
		if (admin.remember) {
			req.session.delete(tokenKey)
			res.cookie(tokenKey, admin.token, {
				maxAge: tokenDays * 24 * 60 * 60 * 1000,
			})
		} else {
			res.clearCookie(tokenKey)
			req.session.set(tokenKey, admin.token)
		}
	}
}

module.exports = AdminService
