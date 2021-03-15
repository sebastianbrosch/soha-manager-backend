import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const File = sequelize.define('File', {
	description: {
		type: DataTypes.STRING
	},
	filename: {
		type: DataTypes.STRING
	},
	mime: {
		type: DataTypes.STRING
	},
	static_filename: {
		type: DataTypes.STRING
	}
}, {
	classMethods: {
		associate: (models) => {
			File.belongsTo(models.Software);
			File.belongsTo(models.Hardware);
		}
	},
	tableName: 'files'
});

export default File;
