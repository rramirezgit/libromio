const Axios = require('axios')
const qs = require('qs')
const BASE_URL = process.env.ANDREANI_API

class ApiAndreani {
	contrato = ''

	constructor(_contrato) {
		this.contrato = _contrato
		this.ApiAndreaniInstance = Axios.default.create({
			baseURL: BASE_URL,
		})
	}
	async CalculateShippingCost(cpDestino, bultos) {
		const parameters = {
			cpDestino,
			contrato: this.contrato,
			bultos,
		}

		return await this.ApiAndreaniInstance.get('/v1/tarifas', {
			params: {
				...parameters,
			},
			paramsSerializer: (params) => {
				return qs.stringify(params)
			},
		})
	}
}

module.exports = ApiAndreani
