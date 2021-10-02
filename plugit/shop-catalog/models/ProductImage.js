const fs = require('fs')
const hash = require('object-hash')
const { v, filenamer, Imager } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class ProductImage extends Model {
		static $props() {
			return {
				img: {
					type: DataTypes.STRING,
				},
				pos: {
					type: DataTypes.INTEGER,
				},
			}
		}

		static $config() {}
		static $joins() {}

		static $init() {
			this.afterUpdate(async (instance) => {
				if (!instance.productId) {
					await instance.destroy()
				}
			})
			this.afterDestroy((instance) => {
				instance.unlinkImages()
			})
		}

		static get publicImgFolder() {
			return '/uploads/products-images'
		}

		static $rules(instance, db) {
			return {
				file: [
					instance.id ? v.ifNotEmpty() : v.required(),
					v.file.isImage(),
					v.file.maxSize(20000),
					v.file.dimension({ minW: 270, minH: 270 }),
				],
			}
		}

		static $fileUpload_file(instance) {
			return {
				filename: ({ path, filename, name, ext }) => {
					return filenamer.safe(filename, {
						name: hash({ filename, date: Date.now() }),
					})
				},
				dest: `public${ProductImage.publicImgFolder}`,
				done: async ({ upload }) => {
					instance.img = upload.filename
					fs.renameSync(upload.path, instance.originalPath)
					await instance.generateImages()
				},
			}
		}

		_makeFilename(suffix, ext = null, urlPath = false) {
			let path = `${ProductImage.publicImgFolder}/${this.img}`
			if (!urlPath) path = `public${path}`
			return filenamer(path, { suffix: `_${suffix}`, ext })
		}

		get originalUrl() {
			return this._makeFilename('original', null, true)
		}
		get originalPath() {
			return this._makeFilename('original')
		}
		get squareUrl() {
			return this._makeFilename('square', 'jpg', true)
		}
		get squarePath() {
			return this._makeFilename('square', 'jpg')
		}
		get mediumUrl() {
			return this._makeFilename('medium', 'jpg', true)
		}
		get mediumPath() {
			return this._makeFilename('medium', 'jpg')
		}
		get bigUrl() {
			return this._makeFilename('big', 'jpg', true)
		}
		get bigPath() {
			return this._makeFilename('big', 'jpg')
		}

		async generateImages() {
			await Imager.jpg(this.originalPath, {
				width: 270,
				height: 270,
				output: this.squarePath,
				keepInput: true,
			})
			await Imager.jpg(this.originalPath, {
				maxSize: 500,
				output: this.mediumPath,
				keepInput: true,
			})
			await Imager.jpg(this.originalPath, {
				maxSize: 1200,
				output: this.bigPath,
				keepInput: true,
			})
		}

		unlinkImages() {
			Imager.unlink([this.originalPath, this.squarePath, this.mediumPath, this.bigPath])
		}

		static $scheme_default() {
			return ['id', 'pos', 'originalUrl', 'squareUrl', 'mediumUrl', 'bigUrl']
		}
	}
