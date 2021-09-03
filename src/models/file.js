import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const File = sequelize.define('File', {
	description: {
		allowNull: true,
		field: 'description',
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
	static_filename: {
		allowNull: false,
		field: 'static_filename',
		type: DataTypes.STRING
	},
	size: {
		allowNull: false,
		field: 'size',
		type: DataTypes.BIGINT
	}
}, {
	classMethods: {
		associate: (models) => {
			File.belongsTo(models.Software);
			File.belongsTo(models.Hardware);
		}
	},
	freezeTableName: true,
	timestamps: true,
	underscored: true,
	tableName: 'files'
});

export default File;
