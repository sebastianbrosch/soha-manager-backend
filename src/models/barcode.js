import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Barcode:
 *       type: object
 *       required:
 *         - code
 *         - format
 *       properties:
 *         code:
 *           type: string
 *         format:
 *           type: string
 *         label:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const Barcode = sequelize.define('Barcode', {
	code: {
		type: DataTypes.STRING
	},
	format: {
		type: DataTypes.STRING
	},
	label: {
		type: DataTypes.STRING
	},
}, {
	classMethods: {
		associate: (models) => {
			Barcode.belongsTo(models.Software);
			Barcode.belongsTo(models.Hardware);
		}
	},
	tableName: 'barcodes'
});

export default Barcode;
