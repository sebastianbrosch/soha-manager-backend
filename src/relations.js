import sequelize from './sequelize.js';

const models = sequelize.models;

export default () => {
	Object.keys(models).forEach(function(modelName) {
		if ('classMethods' in models[modelName].options) {
			models[modelName].options.classMethods.associate(models);
		}
	});
};
