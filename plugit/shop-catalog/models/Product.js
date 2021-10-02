const urlSlug = require('url-slug')
const { capitalCase, snakeCase } = require('case-anything')
const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class Product extends Model {
		static $props() {
			return {
				id: CustomTypes.UUID(),
				name: {
					type: DataTypes.STRING,
					set(value) {
						value = (value && value) || ''
						this.setDataValue('name', value)
						this.setDataValue('urlName', urlSlug(value))
					},
				},
				urlName: {
					type: DataTypes.STRING,
				},
				keywords: {
					type: DataTypes.TEXT,
					defaultValue: '',
					get() {
						let value = this.getDataValue('keywords')
						if (!value) return ''
						return value.split(',').filter((v) => !!v)
					},
					set(value) {
						if (Array.isArray(value)) {
							value = value.filter((v) => !!v).join(',')
						}
						this.setDataValue('keywords', value || '')
					},
				},
				complete: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				active: {
					type: DataTypes.BOOLEAN,
					defaultValue: true,
				},
				activeFrom: {
					...CustomTypes.M_DATE('activeFrom'),
					allowNull: true,
				},
				shopable: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				buyable: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				hasUniqueVariant: {
					type: DataTypes.BOOLEAN,
					defaultValue: true,
				},
				priceMetric: {
					type: DataTypes.STRING,
					allowNull: true,
					_filters: [(v) => v.toLowerCase()],
				},
				unitMetric: {
					type: DataTypes.STRING,
					_filters: [(v) => v.toLowerCase()],
				},
				updatedBy: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				vAttrsPos: {
					type: DataTypes.STRING,
					allowNull: true,
					get() {
						let value = this.getDataValue('vAttrsPos')
						if (!value) return null
						return value.split(',').filter((v) => !!v)
					},
					set(value) {
						if (Array.isArray(value)) {
							value = value.filter((v) => !!v).join(',')
						}
						this.setDataValue('vAttrsPos', value || null)
					},
				},
				relevance: {
					type: DataTypes.INTEGER,
					defaultValue: 0,
				},
			}
		}

		static $config() {
			return {
				paranoid: true,
				timestamps: true,
			}
		}

		static $rules(instance, db) {
			return {
				name: [v.required(), v.maxLen(80)],
				unitMetric: v.required(),
			}
		}

		static $joins(db, { belongsTo, hasMany, hasOne, belongsToMany }) {
			belongsTo('brand', db.Brand, {
				required: true,
				onDelete: 'SET NULL',
			})

			hasMany('variants', db.ProductVariant, {
				onDelete: 'CASCADE',
				required: true,
			})

			hasMany('images', db.ProductImage, {
				onDelete: 'CASCADE',
				required: true,
			})

			hasOne('mainImage', db.ProductImage, {
				onDelete: 'CASCADE',
				required: true,
				scope: { pos: 0 },
			})

			hasOne('secondImage', db.ProductImage, {
				onDelete: 'CASCADE',
				required: true,
				scope: { pos: 1 },
			})

			belongsToMany('attrs', db.AttrVal, {
				onDelete: 'CASCADE',
				through: db.ProductHasAttr,
			})

			belongsToMany('categories', db.Category, {
				onDelete: 'CASCADE',
				through: db.ProductHasCategory,
				required: true,
			})

			belongsTo('category', db.Category, {
				onDelete: 'SET NULL',
				required: true,
			})

			belongsToMany('tags', db.Tag, {
				onDelete: 'CASCADE',
				through: db.ProductHasTag,
			})

			hasOne('info', db.ProductInfo, {
				onDelete: 'CASCADE',
				required: true,
			})

			belongsToMany('collections', db.Collection, {
				onDelete: 'CASCADE',
				through: db.CollectionHasProduct,
			})

			hasMany('wishlistUsers', db.UserWishlistProduct, { onDelete: 'CASCADE' })
		}

		// SCOPES ----------------------------------------------------------------
		static $scope_autocomplete(builder) {
			return builder()
				.set({ attributes: ['id', 'name'] })
				.join('variants', { attributes: ['sku'] })
				.join('mainImage')
		}

		static $scope_list(builder) {
			return builder().join('variants.pvPrice').join('categories').join('mainImage')
		}

		static $scope_images(builder) {
			return builder().join('images').order('images.pos')
		}

		static $scope_full(builder) {
			return this.$scope_images(builder)
				.join('variants.pvPrices')
				.join('variants.stock')
				.join('variants.attrs.attrKey')
				.join('info')
				.join('brand')
				.join('categories')
				.join('attrs.attrKey')
				.join('tags')
		}

		static $scope_full_edit(builder) {
			return this.$scope_full(builder).join('category').join('variants.pvPrices.priceConfig')
		}

		static $scope_card(builder) {
			return builder()
				.join('mainImage')
				.join('secondImage')
				.join('variants', { where: { main: true } })
				.join('variants.pvPrice.priceConfig', { where: { keyname: 'default' } })
		}

		static $scope_productPage(builder) {
			return this.$scope_images(builder)
				.join('info')
				.join('brand')
				.join('categories')
				.join('attrs.attrKey')
				.join('variants.stock')
				.join('variants.attrs.attrKey')
				.join('variants.pvPrice.priceConfig', { where: { keyname: 'default' } })
		}

		static $scope_shopable(builder) {
			return builder().where({ shopable: true })
		}

		static $scope_buyable(builder) {
			return builder().where({ buyable: true })
		}
	}
