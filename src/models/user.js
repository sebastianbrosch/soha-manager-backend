import DataTypes from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../sequelize.js';

const User = sequelize.define('User', {
	email: {
		required: true,
		type: DataTypes.STRING,
		unique: true,
	},
	password: {
		required: true,
		type: DataTypes.STRING,
		unique: false,
  },
	firstname: {
		required: false,
		type: DataTypes.STRING,
		unique: false,
	},
	lastname: {
		required: false,
		type: DataTypes.STRING,
		unique: false,
	},
}, {
	classMethods: {
		associate: models => {
			User.belongsToMany(models.Hardware, { through: 'user_hardware' });
			User.belongsToMany(models.Software, { through: 'user_software' });
		}
	},
	tableName: 'users'
});

User.beforeCreate(async (user, options) => {
  user.password = await bcrypt.hash(user.password, 10);;
});

User.prototype.IsValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default User;
