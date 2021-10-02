import dottie from 'dottie'
import { cloneDeep } from 'lodash'
const data = cloneDeep(window.__SRV || {})
const getData = (key, defaultValue) => {
	let val = dottie.get(data, key)
	if (!val) return defaultValue
	else return typeof val == 'object' ? cloneDeep(val) : val
}
const Srv = (key, defaultValue) => getData(key, defaultValue)

Srv.install = (Vue) => {
	Vue.prototype.$srv = getData
}

export default Srv
