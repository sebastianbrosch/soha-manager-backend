import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const Hardware = sequelize.define('Hardware', {
  name: {
		type: DataTypes.STRING
	},
  serialnumber: {
		type: DataTypes.STRING
	},
	devicetype: {
		type: DataTypes.STRING
	},
	offlinefolder: {
		type: DataTypes.INTEGER
	},
	state: {
  	type: DataTypes.ENUM(['active', 'inactive'])
	},
}, {
	classMethods: {
		associate: (models) => {
			Hardware.hasMany(models.Comment);
			Hardware.hasMany(models.Document);
			Hardware.hasMany(models.Barcode);
			Hardware.belongsToMany(models.User, { through: 'user_hardware' });
			Hardware.belongsToMany(models.Software, { through: 'hardware_software' });
		}
	},
	tableName: 'hardware'
});

export default Hardware;
