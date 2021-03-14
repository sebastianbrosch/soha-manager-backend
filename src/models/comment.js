import DataTypes from 'sequelize';
import sequelize from '../sequelize.js';

const Comment = sequelize.define('Comment', {
	content: {
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
	tableName: 'comments'
});

export default Comment;
