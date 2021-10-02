module.exports = (Model, DataTypes, CustomTypes) =>
	class UserWishlistProduct extends Model {
		static $props() {}

		static $config() {}

		static $joins(db, { belongsTo }) {
			belongsTo('product', db.Product, { onDelete: 'CASCADE' })
			belongsTo('user', db.User, { onDelete: 'CASCADE' })
		}
	}
