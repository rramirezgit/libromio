const _ = require('lodash')
const { db } = require('#/express')
const { ApiRes, emitter } = require('#/utils')

class AddressService {
	static async get(addressId, userId) {
		let where = { id: addressId }
		if (userId !== undefined) where.userId = userId
		return await db.Address.findOne({ where })
	}

	static async getByIds(addressIds, userId) {
		let where = { id: addressIds }
		if (userId !== undefined) where.userId = userId
		return await db.Address.findAll({ where })
	}

	static async getAll(userId) {
		return await db.Address.findAll({ where: { userId } })
	}

	static async getZipcodeById(zipcodeId) {
		return await db.Zipcode.findByPk(zipcodeId)
	}

	static async getZipcode(code) {
		return await db.Zipcode.findOne({ where: { code } })
	}

	static async getZipcodesByState(stateId) {
		return await db.Zipcode.findAll({ where: { stateId } })
	}

	static async getState(stateId) {
		return await db.State.findByPk(stateId)
	}

	static async getStates(countryId) {
		return await db.State.findAll({ where: { countryId } })
	}

	static async getCountry(countryId) {
		return await db.Country.findByPk(countryId)
	}

	static async getCountries() {
		return await db.Country.findAll()
	}

	/**
	 * @param {{
	 * 	id?: number,
	 * 	userId: number,
	 * 	title: string,
	 * 	street: string,
	 * 	streetNumber: string,
	 * 	apartment: string,
	 * 	floor: string,
	 * 	comment: string,
	 * 	intersection1: string,
	 * 	intersection2: string,
	 * 	city: string,
	 * 	zipcodeId: number,
	 * }} data
	 */
	static async save(data) {
		let apiRes = ApiRes()
		await db.$transaction(async (t) => {
			let isNew = !data.id
			let address = isNew ? db.Address.build() : await db.Address.findByPk(data.id)
			if (!address || (!isNew && address.userId && address.userId != data.userId)) {
				apiRes.error('La dirección es inexistente o ha sido eliminada')
				throw null
			}

			let def = {
				userId: undefined,
				title: undefined,
				street: undefined,
				streetNumber: undefined,
				apartment: undefined,
				floor: undefined,
				comment: undefined,
				intersection1: undefined,
				intersection2: undefined,
				city: undefined,
				zipcodeId: undefined,
			}
			data = _.pickBy(_.defaults(data, def), (v, k) => k in def && (isNew || v !== undefined))

			let results = await address.setAndValidate(data)
			if (results !== true) {
				apiRes.validation(results, 'address')
				throw null
			}

			await address.save()
			apiRes.data({ id: address.id })
			let subEvent = isNew ? 'CREATE' : 'UPDATE'
			await emitter.emit('Address.SAVE', { id: address.id, subEvent, t })
		})
		return apiRes
	}

	static async delete(addressId, userId) {
		await db.Address.destroy({
			where: { id: addressId, userId },
		})
		return ApiRes()
	}

	// ZONES
	static async zoneHasZipcode(zoneId, zipcodeId) {
		let zonesIds = await this.getZonesIdsByZipcode(zipcodeId)
		return zonesIds.includes(zoneId)
		return !!result.find1 || !!result.find2
	}

	static async getZonesIdsByZipcode(zipcodeId) {
		let builder = db.$rawQueryBuilder('SELECT')
		let [rows] = await builder
			.col('Zone.id')
			.table('Zone', 'Zipcode')
			.where('Zipcode.id = :zipcodeId', { zipcodeId })
			.where(
				builder.$any(
					'IFNULL(FIND_IN_SET(Zipcode.id, Zone.zipcodesIds), 0) > 0',
					'IFNULL(FIND_IN_SET(Zipcode.stateId, Zone.statesIds), 0) > 0'
				)
			)
			.run()
		return rows.map((row) => row.id)
	}

	static async getZone(zoneId) {
		let zone = await db.Zone.findByPk(zoneId)
		if (!zone) return null

		zone.zipcodes = []
		zone.states = []

		if (zone.zipcodesIds) {
			let ids = zone.zipcodesIds.split(',')
			zone.zipcodes = await db.Zipcode.findAll({ where: { id: ids } })
		}

		if (zone.statesIds) {
			let ids = zone.statesIds.split(',')
			zone.states = await db.State.findAll({ where: { id: ids } })
		}

		return zone
	}

	static getAddressLine(address) {
		let line = []
		line.push(`CP ${address.zipcode.code}`)
		line.push(`${address.street} ${address.streetNumber}`)
		if (address.floor) line.push(`Piso ${address.floor}`)
		if (address.apartment) line.push(`Depto ${address.apartment}`)
		line = line.concat(address.city, address.zipcode.state.name, address.zipcode.state.country.name)

		let str = []
		str.push(`Entre ${address.intersection1} y ${address.intersection2}`)
		if (address.comment) {
			str.push(`Comentarios: ${address.comment}`)
		}
		line.push(`(${str.join('. ')})`)
		return line.join(', ')
	}
}

module.exports = AddressService
