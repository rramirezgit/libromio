const slugify = require('slugify')

const parse = (input) => {
	let initialBar = input.startsWith('/')
	let spl = input.split('/')

	let filename = spl.pop()
	let path = spl.join('/')

	let spl2 = filename.split('.')
	let ext = spl2.length > 1 ? spl2.pop() : ''
	let name = spl2.join('.')
	return { filename, path, ext, name, input, initialBar }
}

const unparse = (parsed, doSanitize) => {
	let path = parsed.initialBar ? '/' : ''
	path += parsed.path
	path += path ? '/' : ''
	if (doSanitize) {
		path = sanitizePath(path)
	}

	let ext = parsed.ext ? '.' + parsed.ext : ''
	let filename = parsed.name + ext
	if (doSanitize) filename = sanitize(filename)
	return path + filename
}

const sanitize = (filename) => {
	return slugify(filename, { remove: /"<>#%\{\}\|\\\^~\[\]`;\?:@=&/g })
}

const sanitizePath = (path) => {
	return path
		.split('/')
		.map((str) => sanitize(str))
		.join('/')
}

const filenamer = (
	input,
	options = {} /*{name, ext, prefix, suffix, path, pathPrefix, pathSuffix, sanitize, lowerCase}*/
) => {
	let parsed = parse(input)
	let output = ''
	if (typeof options == 'function') {
		parsed.sanitize = sanitize
		parsed.sanitizePath = sanitizePath
		output = options(parsed)
		if (typeof output == 'object') {
			output = unparse(output, options.sanitize)
		}
	} else {
		if (options.ext) {
			parsed.ext = options.ext
		}
		if (options.name) {
			parsed.name = options.name
		}
		if (options.prefix) {
			parsed.name = options.prefix + parsed.name
		}
		if (options.suffix) {
			parsed.name = parsed.name + options.suffix
		}
		if (options.path) {
			parsed.path = options.path
		}
		if (options.pathPrefix) {
			parsed.path = options.pathPrefix + '/' + parsed.path
		}
		if (options.pathSuffix) {
			parsed.path = parsed.path + '/' + options.pathSuffix
		}
		output = unparse(parsed, options.sanitize)
	}

	if (options.lowerCase) {
		output = output.toLowerCase()
	}
	output = output.replace(/\/{2,}/, '/')
	return output
}

filenamer.safe = (input, options = {}) => {
	options.lowerCase = true
	options.sanitize = true
	return filenamer(input, options)
}

filenamer.parse = parse
filenamer.unparse = parse

module.exports = filenamer
