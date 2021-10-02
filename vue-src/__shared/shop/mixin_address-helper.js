export default {
	methods: {
		getAddressLine(address) {
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
		},
	},
}
