import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Hardware:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         producer:
 *           type: string
 *         serial_number:
 *           type: string
 *         type:
 *           type: string
 *         purchase_date:
 *           type: string
 *           format: date-time
 *         warranty_date:
 *           type: string
 *           format: date-time
 *         state:
 *           type: string
 *         offline_archive:
 *           type: integer
 *           format: int32
 */
const Hardware = sequelize.define('Hardware', {
  name: {
		type: DataTypes.STRING
	},
	producer: {
		type: DataTypes.STRING
	},
	serial_number: {
		type: DataTypes.STRING
	},
	type: {
		type: DataTypes.STRING
	},
	purchase_date: {
		type: DataTypes.DATE
	},
	warranty_date: {
		type: DataTypes.DATE
	},
	state: {
		type: DataTypes.ENUM(['active', 'inactive', 'spare'])
	},
	offline_archive: {
		type: DataTypes.INTEGER
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
	tableName: 'hardware'
});

export default Hardware;
