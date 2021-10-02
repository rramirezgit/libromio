import Vue from 'vue'

export const compsFromContext = (contextRequire) => {
	let comps = {}
	for (const file of contextRequire.keys()) {
		let comp = contextRequire(file)
		if (comp) comps[comp.default.name] = comp.default
	}
	return comps
}

export const loadCompsFromContext = (contextRequire, asyncMode) => {
	if (asyncMode) {
		for (const file of contextRequire.keys()) {
			let compName = file.match(/comp_(\w+)\.vue$/)[1]
			Vue.component(compName, () => contextRequire(file))
		}
	} else {
		let comps = compsFromContext(contextRequire)
		for (let name in comps) {
			Vue.component(name, comps[name])
		}
	}
}
