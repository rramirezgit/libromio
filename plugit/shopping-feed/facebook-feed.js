const { format } = require('#/utils')

exports.filename = 'facebook-feed.csv'

exports.makeHeaderLine = () => {
	return 'id,title,description,availability,condition,price,link,image_link,brand'
}

exports.makeItemLine = async (product) => {
	let variant = product.variants.find((variant) => variant.main)
	let price = format.price(variant.pvPrice.price, { currency: 'ARS', currencyAfter: true })
	let fields = [
		product.id,
		product.name,
		product.info?.description,
		'in stock',
		'new',
		price,
		`${process.env.APP_URL}/p/${product.urlName}/${product.id}`,
		`${process.env.APP_URL}${product.images[0].bigUrl}`,
		product.brand?.name,
	]

	for (let [i, field] of fields.entries()) {
		field = field ? field.trim().replace(`"`, `""`) : ''
		fields[i] = `"${field}"`
	}

	return fields.join(',')
}

/*exports.contentFilter = (content) => {
	return `\ufeff${content}`
}*/
