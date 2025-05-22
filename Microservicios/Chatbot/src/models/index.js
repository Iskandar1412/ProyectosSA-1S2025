const { Sequelize, DataTypes } = require('sequelize');
const { DATABASE_HOST, DATABASE_PORT, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, TABLE_CHATBOT } = require('../config/env/db.config');

// Initialize Sequelize
const sequelize = new Sequelize(TABLE_CHATBOT, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, {
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Import model
const ChatHistory = require('./templates/chat.model')(sequelize, DataTypes);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.ChatHistory = ChatHistory;

// Sync all models with database
(async function() {
    try {
        // await sequelize.drop();
        // console.log('Tablas eliminadas exitosamente');
        // force: true // recrea las tablas (perdida datos)
        // alter: true // modificaciones (modifica las tablas)
        await sequelize.sync({force: false})
        .then(() => { console.log('OK: Tablas Creadas o Modificadas Exitosamente') })
        .catch((e) => { console.log('Error:', e) });

    } catch(e) {
        console.log('Error en la ejecución de funciones', e);
    }
})();

module.exports = {
    sequelize,
    ChatHistory
};