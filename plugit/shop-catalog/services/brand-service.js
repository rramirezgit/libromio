const { db } = require('#/express')
const { ApiRes } = require('#/utils')

class BrandService {
	static async save(
		id,
		/* { name } */
		data = {},
		/* { logoFile } */
		files = {}
	) {
		if (typeof id == 'object') {
			files = data
			data = id
			id = null
		}

		let isNew = !id
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let brand = isNew ? db.Brand.build() : await db.Brand.findByPk(id, { lock: true })

			if (!brand) {
				apiRes.error('La marca es inexistente o ha sido eliminada')
				throw null
			}

			// Validation
			let results = await brand.setAndValidate({
				name: data.name,
				logoFile: files.logoFile,
			})

			apiRes.validation(results, 'brand')

			if (apiRes.hasErrors()) {
				throw null
			}

			await brand.uploadFile('logoFile')
			await brand.save()
			apiRes.data({ brand })
		})
		return apiRes
	}

	static async delete(id) {
		let brand = await db.Brand.findByPk(id)
		if (brand) {
			await brand.destroy()
		}
		return ApiRes()
	}
}

module.exports = BrandService
