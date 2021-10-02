const path = require('path')
const fs = require('fs')

module.exports = (dir) => {
	if (fs.existsSync(dir)) return
	dir.split(path.sep)
		.filter((folder) => !!folder)
		.forEach((_, i, folders) => {
			let dir = path.join(...folders.slice(0, i + 1))
			if (!fs.existsSync(dir)) fs.mkdirSync(dir)
		})
}
