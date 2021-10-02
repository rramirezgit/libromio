const fs = require('fs')
const gulpTasksPath = 'gulp-tasks'
let allTasks = {}
fs.readdirSync(gulpTasksPath)
	.filter(
		(file) =>
			fs.statSync(gulpTasksPath + '/' + file).isDirectory() &&
			!file.startsWith('_')
	)
	.forEach((moduleName) =>
		Object.assign(allTasks, require(`./${gulpTasksPath}/${moduleName}`))
	)

module.exports = { ...allTasks }
