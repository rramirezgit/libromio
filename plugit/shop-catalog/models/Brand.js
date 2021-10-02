const fs = require('fs')
const urlSlug = require('url-slug')
const { v, filenamer } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class Brand extends Model {
		static $props() {
			return {
				name: {
					type: DataTypes.STRING,
					set(value) {
						value = value || ''
						this.setDataValue('name', value)
						this.setDataValue('urlName', urlSlug(value))
					},
				},
				urlName: {
					type: DataTypes.STRING,
				},
				logo: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			}
		}

		static $init() {
			let deleteLogo = (logo) => {
				let path = `public${Brand.uploadsFolder}/${logo}`
				if (fs.existsSync(path)) {
					fs.unlinkSync(path)
				}
			}
			this.afterSave((instance) => {
				if (instance.changed('logo') && instance._previousDataValues.logo) {
					deleteLogo(instance._previousDataValues.logo)
				}
			})

			this.afterDestroy(({ logo }) => {
				deleteLogo(logo)
			})
		}

		static $joins() {}

		static $rules(instance) {
			return {
				name: [v.required(), v.unique(instance, 'name')],
				logoFile: [v.ifNotEmpty(), v.file.isImage(), v.file.maxSize(1000)],
			}
		}

		static $fileUpload_logoFile(instance) {
			return {
				filename: ({ path, filename, name, ext }) => {
					return filenamer.safe(filename, {
						name: `${instance.name}_${Date.now()}`,
					})
				},
				dest: `public${Brand.uploadsFolder}`,
				done: async ({ upload }) => {
					instance.logo = upload.filename
				},
			}
		}

		static get uploadsFolder() {
			return '/uploads/brands'
		}

		get logoUrl() {
			return this.logo && `${Brand.uploadsFolder}/${this.logo}`
		}

		static $scope_combobox() {
			return {
				attributes: ['id', 'name'],
			}
		}

		static $scheme_default() {
			return ['id', 'name', 'urlName', 'logoUrl']
		}
	}
