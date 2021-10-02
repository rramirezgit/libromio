const h = require('./helpers')

const tasks = [
	{
		key: 'work-start',
		help: 'create a new feature branch to work on',
		task: async (done) => {
			if (!(await h.currentGitBranch('master'))) return done()
			await h.exec(`git fetch`, null, 2)
			await h.exec('git pull origin master')
			let branchName = await h.prompt('Feature branch name you will start to work on: ')
			branchName = branchName.split('/').pop()
			await h.exec(`git checkout -b feature/${branchName} master`)
			done()
		},
	},
	{
		key: 'work-merge',
		help: 'merge master into your current feature branch',
		task: async (done) => {
			let current = await h.currentGitBranch(/^feature\//)
			if (!current) return done()
			await h.commitIfNeeded()
			await h.exec('git checkout master')
			await h.exec('git pull origin master')
			await h.exec('git checkout', [current])
			await h.exec('git merge', ['master'])
			done()
		},
	},
	{
		key: 'work-merge-with',
		help: 'merge any other feature branch into your current feature branch',
		task: async (done) => {
			let current = await h.currentGitBranch(/^feature\//)
			if (!current) return done()
			await h.commitIfNeeded()
			let branchName = await h.featureBranchSelector('want to merge with', (name) => name != current)
			if (!branchName) return done()
			await h.exec('git merge', [`origin/${branchName}`])
			done()
		},
	},
	{
		key: 'work-save',
		help: 'push/publish your feature branch',
		task: async (done) => {
			let current = await h.currentGitBranch(/^feature\//)
			if (!current) return done()
			await h.commitIfNeeded()
			await h.exec(`git fetch`, null, 2)
			await h.exec(`git push -u origin`, [current])
			await h.exec(`git checkout master`)
			await h.exec(`git branch -D`, [current])
			done()
		},
	},
	{
		key: 'work-on',
		help: 'fetch/checkout to a shared feature branch and work on it',
		task: async (done) => {
			if (!(await h.currentGitBranch('master'))) return done()
			let branchName = await h.featureBranchSelector('will work on')
			if (!branchName) return done()
			await h.exec(`git checkout`, [branchName])
			await h.exec(`git pull`)
			done()
		},
	},
	{
		key: 'migration-start',
		help: `Checkout or create the branch 'migrations'`,
		task: async (done) => {
			let current = await h.currentGitBranch(/^feature\//)
			if (!current) return done()
			await h.commitIfNeeded()
			h.saveCurrentBranch(current)
			await h.exec(`git fetch`, null, 2)
			if (!(await h.branchExists('origin/migrations'))) {
				await h.exec('git checkout master')
				await h.exec('git checkout -b migrations')
				await h.exec('git push -u origin migrations')
			} else {
				await h.exec('git checkout migrations')
				await h.exec('git pull')
			}
			h.log(
				`1. Do whatever you want in your models.\n` +
					`2. Run 'plugit-pull' or 'plugit-sync' if the changes comes from the plugits.\n` +
					`3. Run 'migration-make'\n`
			)
			done()
		},
	},
	{
		key: 'migration-make',
		help: `Make the migration and share it`,
		task: async (done) => {
			if (!(await h.currentGitBranch('migrations'))) return done()
			await h.commitIfNeeded('migration-make-before-' + Date.now())
			await h.exec('git pull')
			await h.exec('npx makemigration', null, 0)
			await h.commitIfNeeded('migration-make-after-' + Date.now())
			await h.exec('git push')
			h.log(
				`Run 'migration-run' in order to apply the changes in the database\n` +
					`If you edit the generated migration file, please run 'migration-make' again.`
			)
			done()
		},
	},
	{
		key: 'migration-run',
		help: `Run your generated migration and merge the changes`,
		task: async (done) => {
			if (!(await h.currentGitBranch('migrations'))) return done()
			await h.exec('npx runmigration', null, 0)
			let current = h.getSavedCurrentBranch()
			await h.exec('git checkout', [current])
			await h.exec('git merge migrations')
			await h.exec('git branch -D migrations')
			done()
		},
	},
	{
		key: 'work-test',
		help: `merge your current work branch into 'test' branch for deploy`,
		task: async (done) => {
			let current = await h.currentGitBranch(/^(feature\/|master$)/)
			if (!current) return done()
			await h.commitIfNeeded()

			await h.exec('git checkout test')
			await h.exec('git pull')
			await h.exec('git merge', [current], 1)
			await h.exec('git push')
			await h.exec('git checkout', [current], 1)
			done()
		},
	},
	{
		key: 'work-ready',
		help: `merge your READY TO DEPLOY current work branch into 'master' branch`,
		task: async (done) => {
			let current = await h.currentGitBranch(/^feature\//)
			if (!current) return done()
			await h.commitIfNeeded()

			await h.exec(`git push -u origin`, [current])
			await h.exec('git checkout master')
			await h.exec('git merge', [current])
			await h.exec('git push origin master')
			await h.exec('git branch -D', [current])
			done()
		},
	},
	{
		key: 'work-destroy',
		help: `delete feature remote branch`,
		task: async (done) => {
			let current = await h.currentGitBranch('master')
			if (!current) return done()
			await h.commitIfNeeded()

			h.log(
				`Please, ensure the work on this branch was already merged into ` +
					`'master' with the 'work-ready' task or it's something you really want to destroy.\n`
			)

			let branchName = await h.featureBranchSelector('want to destroy')
			if (!branchName) return done()
			await h.exec(`git push origin --delete`, [branchName])
			done()
		},
	},
	{
		key: 'release',
		help: `pull 'master' branch and merge into 'origin/production' branch for deploy`,
		task: async (done) => {
			if (!(await h.currentGitBranch('master'))) return done()
			await h.commitIfNeeded()
			await h.exec('git pull')
			await h.exec('git push origin master:production')
			done()
		},
	},
]

exports.tasks = tasks
