import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const Barcode = sequelize.define('Barcode', {
	code: {
		allowNull: false,
		field: 'code',
		type: DataTypes.STRING
	},
	format: {
		allowNull: false,
		field: 'format',
		type: DataTypes.STRING
	},
	description: {
		allowNull: false,
		field: 'description',
		type: DataTypes.STRING
	},
}, {
	classMethods: {
		associate: (models) => {
			Barcode.belongsTo(models.Software);
			Barcode.belongsTo(models.Hardware);
		}
	},
	freezeTableName: true,
	timestamps: true,
	underscored: true,
	tableName: 'barcodes'
});

export default Barcode;
