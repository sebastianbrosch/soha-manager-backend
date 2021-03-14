import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

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
