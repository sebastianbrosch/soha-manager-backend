import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const Hardware = sequelize.define('Hardware', {
  description: {
		allowNull: false,
		field: 'name',
		type: DataTypes.STRING
	},
	serialnumber: {
		allowNull: true,
		field: 'serialnumber',
		type: DataTypes.STRING
	},
	deviceType: {
		allowNull: true,
		field: 'device_type',
		type: DataTypes.ENUM(['Notebook', 'Router', 'Switch', 'Printer', 'Monitor', 'Computer', 'Hard Disk - External', 'Hard Disk - Internal', 'IP telephone'])
	},
	purchasedAt: {
		allowNull: true,
		field: 'purchased_at',
		type: DataTypes.DATE
	},
	warrantyAt: {
		allowNull: true,
		field: 'warranty_at',
		type: DataTypes.DATE
	},
	state: {
		allowNull: true,
		field: 'state',
		type: DataTypes.ENUM(['active', 'inactive', 'spare', 'corrupted'])
	},
	offlineArchive: {
		allowNull: true,
		field: 'offline_archive',
		type: DataTypes.STRING
	}
}, {
	classMethods: {
		associate: (models) => {
			Hardware.hasMany(models.Comment);
			Hardware.hasMany(models.Document);
			Hardware.hasMany(models.Barcode);
			Hardware.hasMany(models.File);
			Hardware.belongsToMany(models.User, { through: 'user_hardware' });
			Hardware.belongsToMany(models.Software, { through: 'hardware_software' });
		}
	},
	freezeTableName: true,
	timestamps: true,
	underscored: true,
	tableName: 'hardware'
});

export default Hardware;
