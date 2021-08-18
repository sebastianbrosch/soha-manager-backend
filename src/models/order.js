import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const Order = sequelize.define('Order', {
	product_count: {
		type: DataTypes.INTEGER
	},
	product_name: {
		type: DataTypes.STRING
	},
	product_url: {
		type: DataTypes.STRING
	},
	done_at: {
		type: DataTypes.DATE
	}
});

export default Order;
