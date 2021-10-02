const { db } = require('#/express')
const { makePagination } = require('#/utils')

/**
 * @typedef {{
 * 	userId?: number,
 * 	search?: string,
 * 	page?: number,
 * 	itemsPerPage?: number,
 * 	limit?: number,
 * 	pageLinksQty?: number,
 * 	sortDesc?: boolean,
 * 	onlyCarts: boolean,
 * 	scope?: string,
 * }} OrdersFilters
 */

class OrderService {
	/**
	 * @param {OrdersFilters} filters
	 * @returns {Promise<{orders: Array<{}>, pagination: makePagination.Pagination}>}
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
			return { orders: [], pagination }
		}

		let [idsRows] = await this.getFiltersRawQueryBuilder(filters, true)
			.group('o.id')
			.limit(pagination.offset, pagination.itemsPerPage)
			.run()

		let ids = idsRows.map((row) => row.id)
		let contentScope = filters.scope
		let orders = await db.Order.scope(contentScope).findAll(
			db
				.$queryBuilder()
				.where({ id: ids })
				.order(db.$fn('FIELD', db.$col('Order.id'), ...ids))
				.get()
		)

		return { orders, pagination }
	}

	/**
	 * @param {OrdersFilters} filters
	 * @param {boolean} applySort
	 */
	static getFiltersRawQueryBuilder(filters = {}, applySort = false) {
		let builder = db.$rawQueryBuilder('SELECT').col('o.id').table('`Order` o').group('o.id')

		let { onlyCarts } = filters
		if (onlyCarts) {
			builder.where(`o.mainStatus = 'cart'`)
		} else {
			builder.where(`o.mainStatus <> 'cart'`)
		}

		let { userId } = filters
		if (userId) {
			builder.where('o.userId = :userId', { userId })
		}

		let { search } = filters
		if (search) {
			let words = search
				.split(' ')
				.filter((word) => !!word)
				.slice(0, 5)

			if (words.length == 1 && words[0].match(/^[0-F]{8}-[0-F]{4}-[0-F]{4}-[0-F]{4}-[0-F]{12}$/i)) {
				builder.where('o.id = :idSearch', { idSearch: words[0] })
			} else if (words.length == 1 && words[0].startsWith('#')) {
				builder.where('o.code = :codeSearch', { codeSearch: words[0].substr(1) })
			} else if (words.length) {
				builder.join('JOIN User u ON u.id = o.userId')
				builder.join('JOIN OrderBuyer b ON b.orderId = o.id')
				builder.join('JOIN Invoice i ON i.id = o.invoiceId')

				// prettier-ignore
				let concatCols = [
					'o.code',
					'u.firstname', 'u.lastname', 'u.accountEmail', 'u.contactEmail', 
					'b.firstname', 'b.lastname', 'b.email', 'b.phoneNumber',
					'i.personFirstname', 'i.personLastname', 'i.personIdNumber',
					'i.businessName', 'i.businessIdNumber'
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
			if (onlyCarts) builder.order(`o.createdAt ${direction}`)
			else builder.order(`o.confirmedAt ${direction}`)
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
}

module.exports = OrderService
