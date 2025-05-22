// const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize'); // npm i sequelize
const path = require('path');
const { DATABASE_HOST, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, TABLE_COMPRAS } = require('../config/env/db.config');
const { pool } = require('../config/db');

const sequelize = new Sequelize(TABLE_COMPRAS, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, {
    host: DATABASE_HOST,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    }
});

if (process.env.NODE_ENV !== 'test') {
    sequelize.authenticate()
        .then(() => {
            console.log('Conexión establecida exitosamente');
        })
        .catch((e) => {
            console.log('Error en la conexión con la base de datos:', e);
        });
}
const Ordenes = require('./templates/ordenes.model')(sequelize, DataTypes);
const Productos_Orden = require('./templates/productos_orden.model')(sequelize, DataTypes);


(async function() {
    try {
        // await sequelize.drop();
        // console.log('Tablas eliminadas exitosamente');
        // force: true // recrea las tablas (perdida datos)
        // alter: true // modificaciones (modifica las tablas)
    if (process.env.NODE_ENV !== 'test') {
        await sequelize.sync({force: false})
        .then(() => { console.log('OK: Tablas Creadas o Modificadas Exitosamente') })
        .catch((e) => { console.log('Error:', e) });
    }
    } catch(e) {
        console.log('Error en la ejecución de funciones', e);
    }
})();

module.exports = {
    sequelize,
    Ordenes,
    Productos_Orden
};