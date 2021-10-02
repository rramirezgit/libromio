const fs = require('fs')
const glob = require('glob')
const path = require('path')
const chokidar = require('chokidar')
const noTemplatePaths = new Set()

function makeComponentsAutoloader(dir) {
	const loaded = {}
	const lines = { start: [], exports: [], loads: [] }
	lines.start.push(`/* AUTO-GENERATED FILE - DO NOT EDIT */\n`)

	glob.sync(`${dir}/**/components.js`).forEach((componentsFile) => {
		let _resolvedFile = path.resolve(componentsFile)
		delete require.cache[require.resolve(_resolvedFile)]
		let chunks = require(_resolvedFile)
		lines.start.push(`/* ${componentsFile} */`)

		for (let [chunk, comps] of Object.entries(chunks)) {
			comps = Array.isArray(comps) ? comps : [comps]
			comps
				.map((comp) => {
					if (typeof comp == 'string') return { src: comp }
					else return comp
				})
				.flatMap((comp) => {
					let { src } = comp
					src = src.replace(/([\w-]+)$/, '$1.vue')
					src = path.join(path.dirname(componentsFile), src)
					return glob.sync(src).map((file) => ({ ...comp, file }))
				})
				.filter((comp) => path.basename(comp.file).match(/(comp|view)_[\w-]+\.vue$/))
				.forEach((comp) => {
					// prettier-ignore
					let file = './' + path.relative(dir, comp.file).split(path.sep).join('/')
					let basename = path.basename(file)
					let doExport = basename.match(/^view_/)
					let name = basename.replace(/^(comp|view)_([\w-]+)\.vue$/, '$2')

					let loadedComp = loaded[name]
					if (loadedComp) {
						let { useBase, exportBase, template } = loadedComp
						if (!useBase && !exportBase) return
						name = `Base${name}`
						if (exportBase) doExport = true
						if (template === false) {
							noTemplatePaths.add(path.resolve(comp.file))
							console.log('NO TEMPLATE', name)
						} else noTemplatePaths.delete(path.resolve(comp.file))
					}
					loaded[name] = comp

					let importStr =
						chunk == 'default'
							? `require('${file}').default`
							: `() => import(/* webpackChunkName: "${chunk}" */ '${file}')`

					if (doExport) lines.exports.push(`export const ${name} = ${importStr}`)
					else lines.loads.push(`Vue.component('${name}', ${importStr})`)
				})
		}
	})

	if (!lines.exports.length && !lines.loads.length) return false

	lines.start.push(`\nimport Vue from 'vue'`)
	let str = lines.start.join('\n') + '\n\n' + lines.exports.join('\n') + '\n\n' + lines.loads.join('\n')
	fs.writeFileSync(path.join(dir, 'autoloader.js'), str)
	console.log('DONE', path.join(dir, 'autoloader.js'))
	return true
}

function watchFiles(dir) {
	chokidar
		.watch(`${dir}/**`, { ignored: /autoloader\.js$/, persistent: true })
		.on('change', () => makeComponentsAutoloader(dir))
		.on('unlink', () => makeComponentsAutoloader(dir))
}

// webpack loader
module.exports = function (source) {
	if (noTemplatePaths.has(this.resourcePath)) {
		source = source.replace('<template>', '<!--<template>').replace('</template>', '</template>-->')
	}
	return source
}

module.exports.vueAutoloader = (entriesDirs) => {
	for (let dir of entriesDirs) {
		let hasAutoloader = makeComponentsAutoloader(dir)
		if (process.env.NODE_ENV != 'development') return
		if (hasAutoloader) watchFiles(dir)
	}
}
