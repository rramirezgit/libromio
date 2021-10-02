const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class ProductVariant extends Model {
		static $props() {
			return {
				id: CustomTypes.UUID(),
				sku: {
					type: DataTypes.STRING,
				},
				ean: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				size: CustomTypes.NUMBER(),
				weight: CustomTypes.NUMBER(),
				metricFactor: {
					...CustomTypes.NUMBER(),
					defaultValue: 1,
				},
				type: {
					type: DataTypes.STRING,
					defaultValue: 'physical', // physical | digital
				},
				digital: {
					...CustomTypes.JSON('digital'),
					allowNull: true,
				},
				main: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				position: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
				},
			}
		}

		static $config() {
			return {
				timestamps: true,
			}
		}

		static $init() {
			this.afterUpdate(async (instance) => {
				if (!instance.productId) {
					await instance.destroy()
				}
			})
		}

		static $joins(db, { hasMany, hasOne, belongsTo, belongsToMany }) {
			hasOne('stock', db.ProductVariantStock, {
				onDelete: 'CASCADE',
				required: true,
			})

			hasMany('pvPrices', db.ProductVariantPrice, {
				onDelete: 'CASCADE',
				required: true,
			})

			hasOne('pvPrice', db.ProductVariantPrice, {
				onDelete: 'CASCADE',
				required: true,
			})

			belongsTo('product', db.Product, {
				onDelete: 'CASCADE',
			})

			belongsToMany('attrs', db.AttrVal, {
				onDelete: 'CASCADE',
				through: db.ProductVariantAttr,
			})
		}

		static $fileUpload_digitalFile(instance) {
			return {
				dest: 'storage/digital-products',
				done: async ({ upload, filename }) => {
					instance.digital = { filename: upload.filename, real: filename }
				},
			}
		}
	}
