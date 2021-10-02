const { v } = require('#/utils')

module.exports = (Model, DataTypes, CustomTypes) =>
	class Invoice extends Model {
		static $props() {
			return {
				business: {
					type: DataTypes.BOOLEAN,
				},
				/*address: {
					...CustomTypes.JSON('address'),
				},*/
				personFirstname: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				personLastname: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				personIdNumber: {
					type: DataTypes.STRING(10),
					allowNull: true,
				},
				businessName: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				businessIdNumber: {
					type: DataTypes.STRING(20),
					allowNull: true,
				},
				invoiceType: {
					type: DataTypes.STRING(10),
					allowNull: true,
				},
			}
		}

		static $config() {
			return {}
		}

		static $joins(db, { belongsTo }) {
			belongsTo('user', db.User, {
				required: true,
			})
		}

		static $rules(instance, db) {
			let { business } = instance
			return {
				personFirstname: [v.if(!business), v.minLen(2)],
				personLastname: [v.if(!business), v.minLen(2)],
				businessName: [v.if(business), v.minLen(2)],
				//address: [v.required()],
				personIdNumber: [v.if(!business), v.dni()], //v.unique(instance, 'personIdNumber')
				businessIdNumber: [v.if(business), v.cuit()],
				invoiceType: [
					v.requiredIf(business),
					(value) => {
						let opts = business ? ['A', 'B'] : ['B']
						return v.in(opts)(value)
					},
				],
				userId: [v.validModel(db.User)],
			}
		}

		get recipientName() {
			return this.business ? this.businessName : `${this.personLastname}, ${this.personFirstname}`
		}

		get idNumber() {
			return this.business ? this.businessIdNumber : this.personIdNumber
		}
	}
