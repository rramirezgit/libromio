const git = require('gulp-git')
const fs = require('fs')
const path = require('path')
const cp = require('child_process')
const BITBUCKET_URL = 'https://bitbucket.org/drubbit'
const readline = require('readline')

const h = module.exports
exports.BITBUCKET_URL = BITBUCKET_URL

exports.log = (...msgs) => {
	console.log('-----------------------------------------')
	console.log(...msgs)
}

exports.error = (...msgs) => {
	h.log('ERROR\n', ...msgs)
}

exports.taskWrapper = (task) => {
	return async (done) => {
		console.log('')
		await task(() => {
			console.log('-----------------------------------------\n')
			done()
		})
	}
}

exports.getRemoteUrl = (plugitName, local = false) => {
	let repoName = h.getRepoName(plugitName)
	return local ? path.resolve('..', 'plugits', repoName) : `${BITBUCKET_URL}/${repoName}`
}

exports.getRemoteName = (plugitName, local = false) => {
	let repoName = h.getRepoName(plugitName)
	return local ? `local-${repoName}` : `bitbucket-${repoName}`
}

exports.getRepoName = (plugitName) => {
	return plugitName == 'plugit' ? plugitName : `plugit-${plugitName}`
}

exports.localRepoExists = (plugitName) => {
	return fs.existsSync(h.getRemoteUrl(plugitName, true))
}

exports.getPlugitName = (repoOrRemoteName) => {
	return repoOrRemoteName.replace(/^(local|bitbucket)-/, '').replace(/^plugit-/, '')
}

exports.getAllRemotes = async () => {
	let stdout = await h.exec('git', ['remote'], 2)
	return stdout.split('\n').filter((r) => !!r)
}

exports.isRemote = async (remoteName) => {
	return (await h.getAllRemotes()).includes(remoteName)
}

exports.isPlugitRemote = async (plugitName, local = false) => {
	let remoteName = h.getRemoteName(plugitName, local)
	return await h.isRemote(remoteName)
}

exports.addRemote = async (remoteName, url) => {
	return new Promise((resolve, reject) => {
		git.addRemote(remoteName, url, { quiet: true }, (err) => {
			return err ? reject(err) : resolve()
		})
	})
}

exports.addPlugitRemote = async (plugitName, local = false) => {
	if (await h.isPlugitRemote(plugitName, local)) return
	let remoteName = h.getRemoteName(plugitName, local)
	let url = h.getRemoteUrl(plugitName, local)
	return await h.addRemote(remoteName, url)
}

exports.removeRemote = async (remoteName) => {
	return new Promise((resolve, reject) => {
		git.removeRemote(remoteName, { quiet: true }, (err) => {
			return resolve()
		})
	})
}

exports.removePlugitRemote = async (plugitName, local = false) => {
	let remoteName = h.getRemoteName(plugitName, local)
	return await h.removeRemote(remoteName)
}

function _runNpmCommand(command, commandArgs = []) {
	return new Promise((resolve, reject) => {
		h.log(`npm ${command} ${commandArgs.join(' ')}`)
		let npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
		let proc = cp.spawn(npm, [command, ...commandArgs], { cwd: path.resolve('.'), stdio: 'inherit' })
		proc.on('close', resolve)
	})
}
exports.npmInstall = async (commandArgs = []) => {
	return _runNpmCommand('install', commandArgs)
}

exports.npmUninstall = async (commandArgs = []) => {
	return _runNpmCommand('uninstall', commandArgs)
}

exports.exec = async (command, _args = null, silence = 1) => {
	return new Promise((resolve, reject) => {
		let commandStr = `${command} ${_args ? _args.join(' ') : ''}`
		if (silence < 2) h.log(commandStr)
		cp.exec(commandStr, { cwd: path.resolve('.') }, function (err, stdout, stderr) {
			if (err) return reject(err)
			if (silence < 1) {
				stdout && h.log('stdout\n', stdout)
				stderr && h.log('stderr\n', stderr)
			}
			resolve(stdout)
		})
	})
}

exports.PLUGIT_CONFIG_FILENAME = 'plugit.config.js'
exports.PLUGIT_CONFIG_FILEPATH = path.resolve(exports.PLUGIT_CONFIG_FILENAME)

exports.getPlugitConfig = () => {
	delete require.cache[require.resolve(h.PLUGIT_CONFIG_FILEPATH)]
	try {
		return require(h.PLUGIT_CONFIG_FILEPATH)
	} catch (err) {
		throw new Error(`No '${h.PLUGIT_CONFIG_FILENAME}' file found in '${h.PLUGIT_CONFIG_FILEPATH}'`)
	}
}

exports.getPlugitJson = (plugitName, throwErr = true) => {
	let file = path.resolve('plugit', plugitName, 'plugit.json')
	try {
		return JSON.parse(fs.readFileSync(file))
	} catch (err) {
		if (throwErr) throw new Error(`No plugit.json file found in '${file}'`)
		else return {}
	}
}

exports.isPlugitPulled = (plugitName) => {
	return fs.existsSync(path.resolve('plugit', plugitName, 'plugit.json'))
}

exports.try = async (exitProc, fn) => {
	if (typeof exitProc == 'function') {
		fn = exitProc
		exitProc = true
	}

	try {
		return await fn()
	} catch (err) {
		h.error(err.message)
		if (exitProc) process.exit(1)
		else return false
	}
}

exports.replaceFileContent = (filepath, fn) => {
	let content = fs.existsSync(filepath) ? fs.readFileSync(filepath).toString() : ''
	fs.writeFileSync(filepath, fn(content))
}

exports.replaceJsonData = (filepath, fn) => {
	let data = fs.existsSync(filepath) ? JSON.parse(fs.readFileSync(filepath)) : {}
	data = JSON.stringify(fn(data), null, 2)
	fs.writeFileSync(filepath, data)
}

exports.createDir = (...paths) => {
	let current = null
	for (let _path of paths) {
		current = current ? path.resolve(current, _path) : path.resolve(_path)
		if (!fs.existsSync(current)) fs.mkdirSync(current)
	}
}

exports.touchFile = (onlyIfNotExists, ...paths) => {
	let content = paths.pop()
	let filename = paths.pop()
	let filepath = path.resolve(...paths, filename)
	if (onlyIfNotExists && fs.existsSync(filepath)) return
	h.mkdir(...paths)
	fs.writeFileSync(filepath, content)
}

exports.prompt = async (question) => {
	console.log('-----------------------------------------')

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	if (typeof question == 'string') {
		return await new Promise((resolve) => {
			rl.question(question, function (result) {
				resolve(result)
				rl.close()
			})
		})
	}

	if (Array.isArray(question)) {
		return await new Promise(async (resolve) => {
			let result = {}
			for (let key of question) {
				result[key] = await new Promise((_resolve) => rl.question(`${key}: `, _resolve))
			}
			resolve(result)
			rl.close()
		})
	}

	return await new Promise(async (resolve) => {
		let result = {}
		for (let [key, q] of Object.entries(question)) {
			result[key] = await new Promise((_resolve) => rl.question(q, _resolve))
		}
		resolve(result)
		rl.close()
	})
}

exports.wait = async (ms) => {
	h.log('Waiting....')
	await new Promise((resolve) => setTimeout(resolve, ms))
}

exports.currentGitBranch = async (ensure) => {
	let current = await h.exec('git branch --show-current', null, 2)
	current = current.replace(/(\n|\r)+/g, '').trim()

	if (ensure) {
		if (typeof ensure == 'string') {
			if (current != ensure) {
				h.error(`Please checkout to branch '${ensure}' in order run this task.`)
				return false
			}
		} else if (!current.match(ensure)) {
			h.error(`Please checkout to a branch that matches the pattern ${ensure.toString()}`)
			return false
		}
	}

	return current
}

exports.checkoutGitBranch = async (name, forceCreation = false) => {
	if ((await h.currentGitBranch()) != name) {
		try {
			await h.exec('git checkout', [forceCreation ? '-b' : '', name])
		} catch (err) {
			await h.exec('git checkout', [name])
		}
	}
}

exports.commitIfNeeded = async (msg) => {
	let status = await h.exec('git status', null, 2)
	if (status.includes('nothing to commit')) return

	if (!msg) msg = await h.prompt('You have uncommited changes.\nEnter your commit message: ')
	if (!msg) msg = 'empty message'
	await h.exec('git add .', null, 2)
	await h.exec('git commit -m', [`"${msg}"`], 2)
}

exports.getAllBranchesNames = async (fetchFirst = false) => {
	if (fetchFirst) await h.exec('git fetch', null, 2)
	let result = await h.exec('git branch -a', null, 2)
	return result.split(/(\n|\r)/).map((branch) =>
		branch
			.replace('*', '')
			.trim()
			.replace(/^remotes\//, '')
	)
}

exports.branchExists = async (branchName) => {
	let names = await h.getAllBranchesNames()
	return names.includes(branchName)
}

exports.saveCurrentBranch = (branchName) => {
	fs.writeFileSync('.current-branch', branchName)
}

exports.getSavedCurrentBranch = () => {
	let current = fs.readFileSync('.current-branch')
	fs.unlinkSync('.current-branch')
	return current
}

exports.featureBranchSelector = async (actionText, filter = null) => {
	let names = await h.getAllBranchesNames(true)
	names = names
		.filter((name) => name.startsWith('origin/feature/'))
		.map((name) => name.replace(/^origin\//, ''))

	if (filter) {
		names = names.filter(filter)
	}

	let q = '\n\n'
	q += names.map((name, i) => `[${i + 1}]  ${name}`).join('\n')
	q += '\n\nEnter the number of the branch you ' + actionText + ': '
	let result = (await h.prompt(q)) + ''
	try {
		return names[parseInt(result.trim()) - 1]
	} catch (err) {
		return false
	}
}
