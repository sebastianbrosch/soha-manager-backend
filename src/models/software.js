import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';


/**
 * @swagger
 * components:
 *   schemas:
 *     Software:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         producer:
 *           type: string
 *         license_id:
 *           type: string
 *         license_key:
 *           type: string
 *         number_license:
 *           type: integer
 *           format: int32
 *         state:
 *           type: string
 *         expiry_date:
 *           type: string
 *           format: date-time
 *         offline_archive:
 *           type: integer
 *           format: int32
 */
const Software = sequelize.define('Software', {
	name: {
		type: DataTypes.STRING
	},
	producer: {
		type: DataTypes.STRING
	},
	license_id: {
		type: DataTypes.STRING
	},
	license_key: {
		type: DataTypes.STRING
	},
	number_license: {
		type: DataTypes.INTEGER
	},
	state: {
		type: DataTypes.ENUM(['active', 'inactive', 'expired'])
	},
	expiry_date: {
		type: DataTypes.DATE
	},
	offline_archive: {
		type: DataTypes.INTEGER
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
	tableName: 'software'
});

export default Software;
