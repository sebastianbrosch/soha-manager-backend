import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const Document = sequelize.define('Document', {
	tags: {
		type: DataTypes.STRING
	},
	static_file: {
		type: DataTypes.STRING
	},
	filename: {
		type: DataTypes.STRING
	},
	mime: {
		type: DataTypes.STRING
	},
}, {
	classMethods: {
		associate: models => {
			Document.belongsTo(models.Hardware);
			Document.belongsTo(models.Software);
		}
	},
	tableName: 'documents'
});

export default Document;
