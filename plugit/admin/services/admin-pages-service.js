const PermissionsService = require('./permissions-service')
const _sections = []

class AdminPagesService {
	static addSection(key, section = { path, nav: { title, position } }) {
		if (!this.getSection(key)) {
			_sections.push({ ...section, key, pages: [] })
		}
		return this
	}

	static getSection(key) {
		return _sections.find((section) => section.key == key)
	}

	static getSections() {
		return _sections
	}

	static addPage(
		sectionKey,
		key,
		page = {
			path,
			nav: { title, icon, position },
			permission,
			viewComponent,
		}
	) {
		let section = this.getSection(sectionKey)
		if (section) {
			page.path = `${section.path}${page.path}`
			section.pages.push({ ...page, key })
		}
		return this
	}

	static getPage(sectionKey, key) {
		let section = this.getSection(sectionKey)
		return section && section.pages.find((page) => page.key == key)
	}

	static getAdminRoutes(adminSvc) {
		return _sections
			.map(({ ...section }) => {
				section.pages = section.pages.filter(
					(page) => !page.permission || adminSvc.hasAccess(page.permission)
				)
				return section
			})
			.filter((section) => !!section.pages.length)
	}
}

module.exports = AdminPagesService
