/**
 * @typedef {{
 * 	page: number,
 * 	itemsPerPage: number,
 * 	lastPage: number,
 * 	offset: number,
 * 	itemsLength: number,
 * 	fromItem: number,
 * 	toItem: number,
 * 	links: {nums: Array.<{num: number, active: boolean}>, prev: boolean, next: boolean},
 * }} Pagination
 */

/**
 * @param {{
 * 	itemsLength: number,
 * 	itemsPerPage: number,
 * 	pageLinksQty: number,
 * 	page?: number,
 * }} opts
 * @returns {Pagination} pagination
 */
let makePagination = (opts) => {
	let pag = {}
	pag.itemsLength = opts.itemsLength
	pag.itemsPerPage = Math.max(1, opts.itemsPerPage)
	pag.lastPage = Math.max(1, Math.ceil(pag.itemsLength / pag.itemsPerPage))

	if (isNaN(opts.page) || opts.page < 1) opts.page = 1
	pag.page = Math.min(pag.lastPage, parseInt(opts.page))

	pag.offset = pag.itemsPerPage * (pag.page - 1)
	pag.fromItem = pag.offset + 1
	pag.toItem = Math.min(pag.itemsLength, pag.offset + pag.itemsPerPage)

	pag.links = { nums: [] }
	pag.links.prev = pag.page > 1 //{ url: makeUrl(pag.page - 1) }
	pag.links.next = pag.page < pag.lastPage //{ url: makeUrl(pag.page + 1) }

	let fromPage = Math.max(1, pag.page - Math.floor(opts.pageLinksQty / 2))
	let toPage = Math.min(
		pag.lastPage,
		pag.page + Math.floor(opts.pageLinksQty / 2)
	)
	for (let i = fromPage; i <= toPage; i++) {
		pag.links.nums.push({
			num: i,
			//url: makeUrl(i),
			active: i == pag.page,
		})
	}

	return pag
}

module.exports = makePagination
