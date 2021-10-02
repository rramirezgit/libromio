require('dotenv').config()
require('module-alias/register')
require('@plugit').load(false)

const fs = require('fs')
const glob = require('glob')
const path = require('path')
const { vueAutoloader } = require('./vue.autoloader')

let pageKey = process.env.PAGE_KEY
let entriesDirs = glob.sync(`vue-src/${pageKey}*`)
let pages = {}
let vendorChunksByPage = {}
const IS_VENDOR = /[\\/]node_modules[\\/]/

for (let dir of entriesDirs) {
	let name = path.basename(dir)
	let entry = `${dir}/entry.js`
	let template = `${dir}/index.html`
	let filename = `__views/${name}.html`
	let title = ''
	let chunks = [`${name}-vendors`, name]
	if (fs.existsSync(entry) && fs.existsSync(template)) {
		pages[name] = { entry, template, filename, title, chunks }
		vendorChunksByPage[name] = {
			name: `${name}-vendors`,
			priority: -11,
			chunks: (chunk) => chunk.name === name,
			test: IS_VENDOR,
			enforce: true,
		}
	}
}

if (!Object.keys(pages).length) throw new Error('No pages found')

vueAutoloader(entriesDirs)

module.exports = {
	outputDir: `vue-dist`,
	assetsDir: `__static/${pageKey}`,
	pages,
	css: {
		loaderOptions: {
			sass: {
				additionalData: `@import "~@/${pageKey}/styles-variables.scss"`,
			},
			scss: {
				additionalData: `@import "~@/${pageKey}/styles-variables.scss";`,
			},
		},
	},
	configureWebpack: {
		resolve: {
			alias: {
				'@': path.resolve(__dirname, 'vue-src'),
			},
		},
		module: {
			rules: [{ test: /\.vue$/, loader: path.resolve('vue.autoloader.js'), exclude: /node_modules/ }],
		},
	},
	transpileDependencies: ['vuetify'],
	chainWebpack: (config) => {
		config
			.plugin('copy')
			.tap(([pathConfigs]) => [])
			.end()
			.optimization.splitChunks({
				cacheGroups: {
					...vendorChunksByPage,
				},
			})
	},
}
