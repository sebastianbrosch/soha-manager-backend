import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const Document = sequelize.define('Document', {
	tags: {
		allowNull: true,
		field: 'tags',
		type: DataTypes.STRING
	},
	static_filename: {
		allowNull: false,
		field: 'static_filename',
		type: DataTypes.STRING
	},
	filename: {
		allowNull: false,
		field: 'filename',
		type: DataTypes.STRING
	},
	mime: {
		allowNull: false,
		field: 'mime',
		type: DataTypes.STRING
	},
	size: {
		allowNull: false,
		field: 'size',
		type: DataTypes.BIGINT
	}
}, {
	classMethods: {
		associate: models => {
			Document.belongsTo(models.Hardware);
			Document.belongsTo(models.Software);
		}
	},
	freezeTableName: true,
	timestamps: true,
	underscored: true,
	tableName: 'documents'
});

export default Document;
