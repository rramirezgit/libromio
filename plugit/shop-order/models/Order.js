module.exports = (Model, DataTypes, CustomTypes) =>
	class Order extends Model {
		static $props() {
			return {
				id: CustomTypes.UUID(),
				code: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				mainStatus: {
					type: DataTypes.STRING,
					// cart | confirmed | completed | canceled
				},
				paymentStatus: {
					type: DataTypes.STRING,
					// pending | partiallyPaid | paid | refunded
				},
				makingStatus: {
					type: DataTypes.STRING,
					// pending | awaitingAvalability | onHold | inProcess | readyForPacking | packing | ready
				},
				deliveryStatus: {
					type: DataTypes.STRING,
					// pending | delivered | returned
				},

				readyDate: {
					...CustomTypes.M_DATE('readyDate'),
					allowNull: true,
				},
				confirmedAt: {
					...CustomTypes.M_DATETIME('confirmedAt'),
					allowNull: true,
				},
				paidAt: {
					...CustomTypes.M_DATETIME('paidAt'),
					allowNull: true,
				},
				totalPaid: CustomTypes.PRICE(),
				total: CustomTypes.PRICE(),
				invoiceAddress: {
					...CustomTypes.JSON('invoiceAddress'),
					allowNull: true,
				},
			}
		}

		static $config() {
			return {
				timestamps: true,
			}
		}

		static $joins(db, { belongsTo, hasMany, hasOne }) {
			belongsTo('user', db.User, {
				onDelete: 'CASCADE',
			})
			hasMany('items', db.OrderItem, {
				required: true,
				onDelete: 'CASCADE',
			})
			hasMany('payments', db.OrderPayment, {
				onDelete: 'CASCADE',
			})
			hasOne('delivery', db.OrderDelivery, {
				onDelete: 'CASCADE',
			})
			hasOne('buyer', db.OrderBuyer, {
				onDelete: 'CASCADE',
			})
			belongsTo('invoice', db.Invoice, {
				onDelete: 'RESTRICT',
			})
			hasOne('discount', db.OrderDiscount, {
				onDelete: 'CASCADE',
			})
		}

		static $scope_full(builder) {
			return builder()
				.join('user')
				.join('buyer')
				.join('items')
				.join('payments')
				.join('delivery')
				.join('invoice')
				.join('discount.discountConfig')
		}

		static $scope_paidPayments(builder) {
			return builder().join('payments').where(['payments.paid', true])
		}

		static $scope_list(builder) {
			return builder()
				.join('user', { attributes: ['id', 'accountEmail'] })
				.join('items')
				.join('buyer')
				.join('payments', {
					attributes: ['methodKey', 'methodName', 'optionKey', 'optionName', 'status'],
				})
				.join('delivery', {
					attributes: ['methodKey', 'methodName', 'optionKey', 'optionName', 'data', 'status'],
				})
		}

		get isCart() {
			return this.mainStatus == 'cart'
		}

		static $scheme_default() {
			return ['@all', '@assoc', 'cartData', 'statusesInfo']
		}
	}
