const fs = require('fs')
const createDir = require('./create-dir')
const filenamer = require('./filenamer')

const fileUploader =
	(uploadedFiles) =>
	async (fileKey, { filename, dest, done, custom }) => {
		let filesData = typeof fileKey == 'string' ? uploadedFiles[fileKey] : fileKey
		if (!filesData || (dest === undefined && custom === undefined)) {
			return false
		}

		filesData = Array.isArray(filesData) ? filesData : [filesData]
		for (let fileData of filesData) {
			let data = { ...fileData }
			data.filename = data.name
			let spl = data.name.split('.')
			data.ext = spl.pop()
			data.name = spl.join('.')

			if (custom) {
				await custom(data)
				fs.existsSync(data.path) && fs.unlinkSync(data.path)
				return
			}

			let upFilename
			if (typeof filename == 'function') {
				filename = filename(data)
			}

			if (typeof filename == 'object') {
				upFilename = filenamer(data.filename, {
					name: filename.name,
					ext: filename.ext,
				})
			}

			if (typeof filename == 'string') {
				upFilename = filename
			}

			upFilename = upFilename || data.filename
			upDest = typeof dest == 'function' ? await dest(data) : dest
			if (!upDest.endsWith('/')) upDest += '/'

			let c = 0

			let tmpFilename = upFilename
			while (fs.existsSync(`${upDest}${upFilename}`)) {
				c++
				upFilename = filenamer(tmpFilename, { suffix: `(${c})` })
			}

			createDir(upDest)

			let upPath = `${upDest}${upFilename}`
			fs.renameSync(data.path, upPath)

			let parsed = filenamer.parse(upFilename)

			data.upload = {
				dest: upDest,
				filename: upFilename,
				ext: parsed.ext,
				name: parsed.name,
				path: upPath,
			}

			done && (await done(data))
		}

		return true
	}

module.exports = fileUploader
