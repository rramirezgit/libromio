module.exports = (Model, DataTypes, CustomTypes) =>
	class OrderItem extends Model {
		static $props() {
			return {
				qty: {
					...CustomTypes.NUMBER(),
				},
				refId: {
					type: DataTypes.UUID,
				},
				refType: {
					type: DataTypes.STRING,
				},
				sku: {
					type: DataTypes.STRING,
				},
				name: {
					type: DataTypes.STRING,
				},
				variantName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				readyDate: {
					...CustomTypes.M_DATE('readyDate'),
					allowNull: true,
				},
				initPrice: {
					...CustomTypes.PRICE(),
				},
				initTotal: {
					...CustomTypes.PRICE(),
				},
				discount: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				discountTotal: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				discountName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				discountPct: {
					type: DataTypes.INTEGER.UNSIGNED,
				},
				reachedByOrderDiscount: {
					type: DataTypes.BOOLEAN,
					defaultValue: false,
				},
				orderDiscountTotal: {
					...CustomTypes.PRICE(),
					defaultValue: 0,
				},
				price: {
					...CustomTypes.PRICE(),
				},
				total: {
					...CustomTypes.PRICE(),
				},
				image: {
					...CustomTypes.FILE(),
				},
				size: CustomTypes.NUMBER(),
				weight: CustomTypes.NUMBER(),
				unitMetric: {
					type: DataTypes.STRING,
				},
				type: {
					type: DataTypes.STRING,
					defaultValue: 'physical', // physical | digital
				},
				digital: {
					...CustomTypes.JSON('digital'),
					allowNull: true,
				},
			}
		}

		static $config() {
			return {}
		}

		static $joins(db, { belongsTo, hasOne }) {
			belongsTo('order', db.Order, {
				onDelete: 'CASCADE',
				required: true,
			})
		}

		static $scheme_default() {
			return ['@all', '@assoc', 'cartData']
		}
	}
