const { format } = require('#/utils')
const { CategoryService } = require('#/shop-catalog')

exports.filename = 'google-shopping-feed.txt'
exports.makeHeaderLine = () => {
	return 'id|title|description|link|image_link|availability|price|sale_price|google_product_category|product_type|brand|gtin|mpn'
}

exports.makeItemLine = async (product) => {
	let variant = product.variants.find((variant) => variant.main)
	let price = format.price(variant.pvPrice.price, { currency: 'ARS', currencyAfter: true })
	let prevPrice = variant.pvPrice.prevPrice
		? format.price(variant.pvPrice.prevPrice, { currency: 'ARS', currencyAfter: true })
		: price

	let fields = [
		product.id,
		product.name,
		product.info?.description,
		`${process.env.APP_URL}/p/${product.urlName}/${product.id}`,
		`${process.env.APP_URL}${product.images[0].bigUrl}`,
		'in stock',
		prevPrice,
		price,
		null,
		await CategoryService.getFamilyName(product.categoryId),
		product.brand?.name,
		variant.ean,
		null,
	]

	for (let [i, field] of fields.entries()) {
		fields[i] = field ? field.replace('|', '/').trim() : ''
	}
	return fields.join('|')
}
