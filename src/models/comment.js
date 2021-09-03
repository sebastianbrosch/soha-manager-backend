import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const Comment = sequelize.define('Comment', {
	content: {
		allowNull: false,
		field: 'content',
		type: DataTypes.STRING
	},
}, {
	classMethods: {
		associate: (models) => {
			Comment.belongsTo(models.Software);
			Comment.belongsTo(models.Hardware);
			Comment.belongsTo(models.User);
		}
	},
	freezeTableName: true,
	timestamps: true,
	underscored: true,
	tableName: 'comments'
});

export default Comment;
