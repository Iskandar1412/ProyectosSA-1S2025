// const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize'); // npm i sequelize
const path = require('path');
const { DATABASE_HOST, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, TABLE_DEVOLUCIONES } = require('../config/env/db.config');

const sequelize = new Sequelize(TABLE_DEVOLUCIONES, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, {
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

const Devoluciones = require('./templates/devoluciones.model')(sequelize, DataTypes);
const CuponDevolucion = require('./templates/cupon_devolucion.model')(sequelize, DataTypes);

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
    Devoluciones,
    CuponDevolucion
};