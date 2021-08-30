import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const Software = sequelize.define('Software', {
	name: {
		allowNull: false,
		field: 'name',
		type: DataTypes.STRING
	},
	licenseKey: {
		allowNull: true,
		field: 'license_key',
		type: DataTypes.STRING
	},
	licensePassword: {
		allowNull: true,
		field: 'license_password',
		type: DataTypes.STRING
	},
	licenseAmount: {
		allowNull: true,
		field: 'license_amount',
		type: DataTypes.INTEGER
	},
	state: {
		allowNull: false,
		defaultValue: 'active',
		field: 'state',
		type: DataTypes.ENUM(['active', 'inactive'])
	},
	offlineArchive: {
		allowNull: true,
		field: 'offline_archive',
		type: DataTypes.STRING
	},
	expiresAt: {
		allowNull: true,
		field: 'expires_at',
		type: DataTypes.DATE
	}
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
	freezeTableName: true,
	timestamps: true,
	underscored: true,
	tableName: 'software'
});

export default Software;
