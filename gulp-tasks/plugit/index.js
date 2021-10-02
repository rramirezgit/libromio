const git = require('gulp-git')
const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
let { argv } = require('yargs')
const h = require('./helpers')
const work = require('./work')

async function _pull(plugitName, local = false) {
	await h.addPlugitRemote(plugitName, local)
	let remoteName = h.getRemoteName(plugitName, local)
	h.log(`PULLING ${remoteName}...`)
	try {
		await h.exec('git', ['pull', remoteName, 'master', '--allow-unrelated-histories'], 2)
		await h.removePlugitRemote(plugitName, local)
	} catch (err) {
		await h.removePlugitRemote(plugitName, local)
		if (err.message.includes('-> FETCH_HEAD')) return
		throw err
	}
}

async function _pullRepo(plugitNames, local = false, pulled = []) {
	plugitNames = Array.isArray(plugitNames) ? plugitNames : [plugitNames]
	for (let plugitName of plugitNames) {
		let nextPlugits = await h.try(async () => {
			if (pulled.includes(plugitName)) return
			pulled.push(plugitName)

			//let pullFromLocal = local && h.localRepoExists(plugitName)
			//if (local && !pullFromLocal) h.log(`Plugit ${plugitName} pulled from bitbucket`)

			let data = h.getPlugitJson(plugitName, false)
			if (!data.local) {
				await _pull(plugitName, local)
			}
			if (plugitName == 'plugit') return
			return await _runPlugitJson(plugitName)
		})

		if (nextPlugits) {
			await _pullRepo(nextPlugits, local, pulled)
		}
	}
}

async function _updateAllLocalPlugits() {
	let plugitsPath = path.join('..', 'plugits')
	let dirs = fs.readdirSync(plugitsPath)
	for (let dir of dirs) {
		if (!dir.match(/^plugit/)) continue
		h.log(`UPDATING local plugits/${dir}...`)
		await h.exec('cd', [path.resolve(plugitsPath, dir)], 2)
		await h.exec('git pull origin master', null, 2)
	}
	await h.exec('cd', [path.resolve('.')])
}

async function _runPlugitJson(plugitName) {
	let data = h.getPlugitJson(plugitName)

	let repoName = h.getRepoName(plugitName)

	if (data.parent) {
		if (!h.isPlugitPulled(data.parent)) {
			throw new Error(`${repoName} needs ${h.getRepoName(data.parent)} to be pulled first`)
		}
	}

	let npmKeys = ['npm', 'npm-dev']

	for (let key of npmKeys) {
		let packages = data[key]
		if (!packages) {
			//h.log(`${repoName}: no ${key.toUpperCase()} packages in plugit.json\n`)
			continue
		}
		let packagesJsonKey = key == 'npm' ? 'dependencies' : 'devDependencies'
		let installed = JSON.parse(fs.readFileSync('package.json'))[packagesJsonKey] || {}

		packages = packages.map((package) => {
			let uninstall = package.startsWith('!!!')
			if (uninstall) package = package.substr(3)
			let m = package.match(/^(.+?)(@([0-9.]+))?$/)
			return { installName: m[0], name: m[1], version: m[3], uninstall }
		})
		let toInstall = packages.filter(({ name, version, uninstall }) => {
			if (uninstall) return false
			if (!installed[name]) return true
			return version && !installed[name].startsWith(`^${version}`)
		})
		let toUninstall = packages.filter(({ name, uninstall }) => {
			return uninstall && installed[name]
		})
		if (toInstall.length) {
			let commandOpt = key == 'npm' ? '--save' : '--save-dev'
			await h.npmInstall([...toInstall.map((p) => p.installName), commandOpt])
		}
		if (toUninstall.length) {
			await h.npmUninstall(toUninstall.map((p) => p.name))
		}
	}

	if (data.package) {
		h.replaceJsonData('package.json', (package) => {
			for (let key in data.package) {
				let obj = data.package[key]
				if (Array.isArray(obj)) {
					package[key] = obj
				} else if (typeof obj == 'object') {
					package[key] = { ...(package[key] || {}), ...obj }
				} else {
					package[key] = obj
				}
			}
			return package
		})
	}

	if (data.gitignore) {
		let lines = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore') : ''
		lines = lines
			.toString()
			.split(/(\n|\r|\n\r)+/)
			.map((line) => line.trim())
			.filter((line) => !!line)
		let newLines = [`#${repoName}`, ...data.gitignore].filter((newLine) => !lines.includes(newLine))
		lines = lines.concat(newLines).join('\n')
		fs.writeFileSync('.gitignore', lines)
	}

	let nextPlugits = []
	if (data.requires) {
		nextPlugits = nextPlugits.concat(data.requires)
	}

	if (data.children) {
		nextPlugits = nextPlugits.concat(data.children)
	}

	if (data.plugins) {
		nextPlugits = nextPlugits.concat(data.plugins)
	}

	return nextPlugits
}

async function task_init(done) {
	if (fs.existsSync(h.PLUGIT_CONFIG_FILEPATH)) {
		h.error('Plugit is already initialized')
		return done()
	}

	await h.currentGitBranch('master')

	let entryName = await h.prompt('Repository name: ')
	await h.removeRemote('origin')
	await h.addRemote('origin', `${h.BITBUCKET_URL}/${entryName}`)

	fs.copyFileSync(path.join(__dirname, 'templates', h.PLUGIT_CONFIG_FILENAME), h.PLUGIT_CONFIG_FILEPATH)
	h.replaceFileContent(h.PLUGIT_CONFIG_FILEPATH, (content) => {
		return content.replace('@entry', `@${entryName}`)
	})

	h.createDir('plugit', `@${entryName}`)
	let entryDir = path.join('plugit', `@${entryName}`)
	let entryIndexPath = path.join(entryDir, 'index.js')
	let entryJsonPath = path.join(entryDir, 'plugit.json')

	if (!fs.existsSync(entryIndexPath)) {
		fs.copyFileSync(path.join(__dirname, 'templates', 'index.js'), entryIndexPath)
	}

	if (!fs.existsSync(entryJsonPath)) {
		fs.copyFileSync(path.join(__dirname, 'templates', 'plugit.json'), entryJsonPath)
		let result = await h.prompt({
			requires: 'Required plugits (comma-separated): ',
			plugins: 'Plugins (comma-separated): ',
		})

		h.replaceJsonData(entryJsonPath, (data) => {
			if (result.requires) {
				data.requires = result.requires.split(',')
			}
			if (result.plugins) {
				data.plugins = result.plugins.split(',')
			}
			data.package = {
				name: entryName,
				repository: {
					type: 'git',
					url: `git+${h.BITBUCKET_URL}/${entryName}`,
				},
				homepage: `https://${entryName}.com`,
			}
			return data
		})
	}

	await h.wait(3000)
	await _pullRepo(`@${entryName}`)
	await h.wait(3000)
	await h.npmInstall()

	await h.commitIfNeeded('init')
	await h.exec('git checkout -b test')
	await h.exec('git push -u origin test')
	await h.exec('git checkout master')
	await h.exec('git push -u origin master:production')
	await h.exec('git push -u origin master')

	done()
}

async function task_pull(done) {
	if (!argv.plugit) {
		if (!(await h.currentGitBranch(/^(feature\/|migrations$)/))) return done()
		await _updateAllLocalPlugits()
	}
	await h.try(async () => {
		let plugitName = argv.plugit ? 'plugit' : h.getPlugitConfig().entry
		await _pullRepo(plugitName)
	})
	done()
}

// LOCAL SYNC
let queue = []
let consuming = false
let watched = []
async function _consume() {
	consuming = true

	let plugitName = queue.shift()
	if (!plugitName) {
		consuming = false
		return
	}

	await _pullRepo(plugitName, true)
	await _consume()
}
async function _addToQueue(plugitName) {
	queue.push(plugitName)
	if (!consuming) await _consume()
}
function _watchLocal(plugitName) {
	if (watched.includes(plugitName)) return
	watched.push(plugitName)
	let dir = h.getRemoteUrl(plugitName, true)
	chokidar
		.watch(`${dir}/.git/refs/heads/master`, {
			//ignored: /(^|[\/\\])\../, // ignore dotfiles
			persistent: true,
		})
		.on('change', () => {
			h.log('CHANGED', plugitName)
			_addToQueue(plugitName)
		})
}

async function task_sync(done) {
	if (!(await h.currentGitBranch(/^(feature\/|migrations$)/))) return done()
	await h.try(async () => {
		let { entry } = h.getPlugitConfig()
		let plugitNames = []
		let add = (name) => !plugitNames.includes(name) && plugitNames.push(name)
		let recursive = (plugitName) => {
			let { local, requires = [], children = [], plugins = [] } = h.getPlugitJson(plugitName)
			if (!local && !h.localRepoExists(plugitName)) {
				throw new Error(`No local repository found for plugit '${plugitName}'`)
			}
			if (!local) add(plugitName)
			requires.forEach(recursive)
			children.forEach(recursive)
			plugins.forEach(recursive)
		}

		recursive(entry)
		await _addToQueue(entry)
		for (let plugitName of plugitNames) _watchLocal(plugitName)

		setTimeout(() => {
			h.log(`\nWatching local plugit repositories...`)
		}, 0)
	})
}

function task_plugit_help(done) {
	console.log(`\nPlugit repositories tasks...\n`)
	console.log(`gulp plugit-init   (Set remote 'origin' repo and rename 'plugit' remote repo)`)
	console.log('gulp plugit-pull   (git pull all remote plugit repositories)')
	console.log('gulp plugit-sync   (sync all local plugit repositories)')
	done()
}

function task_work_help(done) {
	console.log('\nWork Tasks...\n')
	for (let task of work.tasks) {
		console.log(`gulp ${task.key}   (${task.help})`)
	}
	done()
}

exports['plugit'] = h.taskWrapper(task_plugit_help)
exports['plugit-help'] = h.taskWrapper(task_plugit_help)
exports['plugit-init'] = h.taskWrapper(task_init)
exports['plugit-pull'] = h.taskWrapper(task_pull)
exports['plugit-sync'] = h.taskWrapper(task_sync)

exports['work'] = h.taskWrapper(task_work_help)
exports['work-help'] = h.taskWrapper(task_work_help)
for (let task of work.tasks) {
	exports[task.key] = h.taskWrapper(task.task)
}
