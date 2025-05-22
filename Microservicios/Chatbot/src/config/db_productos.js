const mysql = require('mysql2/promise');
const { DATABASE_HOST, DATABASE_PORT, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, TABLE_PRODUCTOS } = require('./env/db.config')

const pool_productos = mysql.createPool({
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    user: DATABASE_MYSQL_USER,
    password: DATABASE_MYSQL_PASSWORD,
    database: TABLE_PRODUCTOS,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool_productos.getConnection()
    .then(connection => {
        console.log('Database Conected with pool');
        connection.release();
    })
    .catch(error => {
        console.log('Error to connect db:', error);
    }
);

module.exports = pool_productos;
