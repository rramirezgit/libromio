const { db } = require('#/express')

class ProductManager {
	constructor(product) {
		this._product = product
	}

	static async fromId(id) {
		let product = await db.Product.findByPk(id)
		return new ProductService(product)
	}

	static async fromHash(hash) {
		let product = await db.Product.findOne({
			where: { hash },
		})
		return new ProductService(product)
	}

	get product() {
		return this._product
	}
}

module.exports = ProductManager
