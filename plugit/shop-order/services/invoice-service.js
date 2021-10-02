const _ = require('lodash')
const { db } = require('#/express')
const { ApiRes } = require('#/utils')

class InvoiceService {
	static async get(id, userId) {
		return await db.Invoice.findOne({ where: { id, userId } })
	}

	static async getAll(userId) {
		return await db.Invoice.findAll({ where: { userId } })
	}

	/**
	 * @param {{
	 * 	userId: number,
	 * 	business: boolean,
	 * 	personFirstname: string,
	 * 	personLastname: string,
	 * 	personIdNumber: string,
	 * 	businessName: string,
	 * 	businessIdNumber: string,
	 * 	address: Object,
	 * 	invoiceType: string,
	 * }} data
	 * @returns {Promise<Object>} apiRes
	 */
	static async create(data = {}) {
		let apiRes = ApiRes()
		let invoice = db.Invoice.build()

		let def = {
			userId: undefined,
			business: false,
			personFirstname: undefined,
			personLastname: undefined,
			personIdNumber: undefined,
			businessName: undefined,
			businessIdNumber: undefined,
			//address: undefined,
			invoiceType: undefined,
		}
		data = _.pickBy(_.defaults(data, def), (v, k) => k in def)
		if (data.business) {
			data.personFirstname = null
			data.personLastname = null
			data.personIdNumber = null
		} else {
			data.businessName = null
			data.businessIdNumber = null
			data.invoiceType = null
		}

		let results = await invoice.setAndValidate(data)
		if (results !== true) {
			return apiRes.validation(results, 'invoice')
		}
		await invoice.save()
		return apiRes.data({ invoice })
	}
}

module.exports = InvoiceService
