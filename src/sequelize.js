import settings from '../settings.js';
import Sequelize from 'sequelize';

const sequelize = new Sequelize(settings.database.name, settings.database.username, settings.database.password, {
    host: settings.database.host,
    dialect: settings.database.dialect
});

export default sequelize;
