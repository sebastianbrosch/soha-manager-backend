import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const Software = sequelize.define('Software', {
  name: {
		type: DataTypes.STRING
	},
  units: {
		type: DataTypes.INTEGER
	},
  license: {
		type: DataTypes.STRING
	},
  offlinefolder: {
		type: DataTypes.INTEGER
	},
  state: {
		type: DataTypes.ENUM(['active', 'inactive', 'expired'])
	},
}, {
	classMethods: {
		associate: models => {
			Software.hasMany(models.Comment);
			Software.hasMany(models.Document);
			Software.hasMany(models.Barcode);
			Software.hasMany(models.File);
			Software.belongsToMany(models.User, { through: 'user_software' });
			Software.belongsToMany(models.Hardware, { through: 'hardware_software' });
		},
	},
	tableName: 'software'
});

export default Software;
