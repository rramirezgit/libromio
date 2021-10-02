const { db } = require('#/express')
const { ApiRes } = require('#/utils')
class UserWishlistService {
	static init() {}
	static async removeProduct(userId, productId) {
		await db.UserWishlistProduct.destroy({
			where: { userId, productId },
		})
	}
	static async addProduct(userId, productId) {
		try {
			await db.UserWishlistProduct.findOrCreate({
				defaults: { userId, productId },
				where: { userId, productId },
			})
		} catch (error) {}
	}

	static async getProducts(userId, scope) {
		let builder = db.$queryBuilder().join('wishlistUsers', { where: { userId }, required: true })
		return await db.Product.scope(scope).findAll(builder.get())
	}

	static async getProductsIds(userId) {
		let rows = await db.UserWishlistProduct.findAll(
			db
				.$queryBuilder()
				.where({ userId })
				.get({ attributes: ['productId'], raw: true })
		)

		return rows.map(row => row.productId)
	}
}

module.exports = UserWishlistService
