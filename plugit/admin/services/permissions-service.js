const tree = [
	{
		key: 'webmaster',
		name: 'Webmaster',
		description: '',
		children: ['full'],
	},
	{
		key: 'full',
		name: 'Full',
		description: '',
		children: [],
	},
]

class PermissionsService {
	static getAll() {
		return tree
	}

	static get(key) {
		return tree.find((p) => p.key == key)
	}

	static define(key, { name, description, children, addChildren }) {
		let permission = this.get(key)
		if (!permission) {
			permission = { key }
			tree.push(permission)
		}
		permission.name = name || permission.name
		permission.description = description || permission.description || ''
		permission.children = permission.children || []
		if (children) {
			permission.children = Array.isArray(children) ? children : [children]
		}
		if (addChildren) {
			permission.children = permission.children.concat(
				Array.isArray(addChildren) ? addChildren : [addChildren]
			)
		}
	}

	static hasAccess(adminPermissionsKeys, toPermissionKey) {
		adminPermissionsKeys = Array.isArray(adminPermissionsKeys)
			? adminPermissionsKeys
			: adminPermissionsKeys.split(',')
		let all = []
		let recursiveCall = (key) => {
			let permission = this.get(key)
			if (permission && !all.includes(key)) {
				all.push(key)
				permission.children.forEach(recursiveCall)
			}
		}
		adminPermissionsKeys.forEach(recursiveCall)
		return all.includes(toPermissionKey)
	}
}

module.exports = PermissionsService
