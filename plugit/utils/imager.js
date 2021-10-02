const sharp = require('sharp')
const filenamer = require('./filenamer')
const fs = require('fs')
const sizeOf = require('image-size')

const Imager = {}
Imager.JPG_OPTIONS = { mozjpeg: true }
Imager.WEBP_OPTIONS = {
	nearLossless: false,
	reductionEffort: 6,
	smartSubsample: true,
}
Imager.PNG_OPTIONS = {
	//compressionLevel: 9,
	palette: true,
}

let __process = async (
	inputPath,
	ext,
	/* {
		background: {r,g,b,alpha} | 'transaparent|white|black'
		resize: {
			maxSize: Number,
			width: Number,
			height: Number,
			fit: 'contain|cover',
			background,
		},
		webp: Boolean | {of: 'input|output'},
		output: String | {path: String, ...filenamerOpts}
		deleteInput: Boolean,
	} */
	opts,
	_noReturn
) => {
	let obj = sharp(inputPath)

	let resize = { ...(opts.resize || {}) }
	resize.height = resize.height || opts.height
	resize.width = resize.width || opts.width
	resize.maxSize = resize.maxSize || opts.maxSize

	if (resize.maxSize) {
		let { width, height } = sizeOf(inputPath)
		let isWider = width > height
		resize.width = isWider ? resize.maxSize : null
		resize.height = isWider ? null : resize.maxSize
		resize.withoutEnlargement = true
		delete resize.maxSize
	}

	let background = resize.background || opts.background
	if (!background) {
		background = ext == 'jpg' ? 'white' : 'transparent'
	}

	if (typeof background == 'string') {
		switch (background) {
			case 'transparent':
				let alpha = ext == 'jpg' ? 1 : 0
				background = { r: 255, g: 255, b: 255, alpha }
				break
			case 'black':
				background = { r: 0, g: 0, b: 0, alpha: 1 }
				break
			case 'white':
			default:
				background = { r: 255, g: 255, b: 255, alpha: 1 }
		}
	}

	resize.background = background
	resize.fit = resize.fit || 'contain'
	obj.resize(resize)

	if (ext == 'jpg') {
		obj.jpeg(Imager.JPG_OPTIONS)
	} else if (ext == 'webp') {
		obj.webp(Imager.WEBP_OPTIONS)
	} else if (ext == 'png') {
		obj.png(Imager.WEBP_OPTIONS)
	}

	let outputPath = opts.output || inputPath
	if (typeof outputPath == 'object') {
		outputPath.ext = ext
		let { path, ...filenamerOpts } = outputPath
		outputPath = filenamer(path, filenamerOpts)
	} else {
		outputPath = filenamer(outputPath, { ext })
	}

	if (outputPath == inputPath) {
		obj = sharp(await obj.toBuffer())
	}
	await obj.toFile(outputPath)

	if (_noReturn) return

	if (ext != 'webp' && opts.webp !== false) {
		let webpInputPath = outputPath
		if (typeof opts.webp == 'object') {
			webpInputPath = opts.webp.of == 'input' ? inputPath : outputPath
		}
		await __process(webpInputPath, 'webp', opts, true)
	}

	if (opts.keepInput !== true && inputPath != outputPath) {
		fs.unlinkSync(inputPath)
	}

	return {
		path: outputPath,
		url: outputPath.replace(/^\/?public/, ''),
	}
}

Imager.jpg = async (path, opts = {}) => await __process(path, 'jpg', opts)
Imager.png = async (path, opts = {}) => await __process(path, 'png', opts)
Imager.webp = async (path, opts = {}) => await __process(path, 'webp', opts)
Imager.unlink = (paths, publicPaths = true) => {
	if (!Array.isArray(paths)) paths = [paths]
	paths = paths.filter((path) => !!path)
	if (publicPaths) {
		paths = paths.map((path) => {
			return path.startsWith('public/') ? path : `public${path}`
		})
	}
	for (let path of paths) {
		if (fs.existsSync(path)) fs.unlinkSync(path)
		let webpPath = filenamer(path, { ext: 'webp' })
		if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath)
	}
}
module.exports = Imager
