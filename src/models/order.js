import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const Order = sequelize.define('Order', {
	buyCount: {
		type: DataTypes.INTEGER
	},
	productName: {
		type: DataTypes.STRING
	},
	productUrl: {
		type: DataTypes.STRING
	},
	shopName: {
		type: DataTypes.STRING
	},
	doneAt: {
		type: DataTypes.DATE
	}
}, {
	freezeTableName: true,
	timestamps: true,
	underscored: true,
	tableName: 'orders'
});

export default Order;
