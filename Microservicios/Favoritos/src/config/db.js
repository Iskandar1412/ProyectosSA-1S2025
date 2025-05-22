const mysql = require('mysql2/promise');
const { DATABASE_HOST, DATABASE_PORT, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, TABLE_FAVORITOS } = require('./env/db.config')

const pool = mysql.createPool({
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    user: DATABASE_MYSQL_USER,
    password: DATABASE_MYSQL_PASSWORD,
    database: TABLE_FAVORITOS,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log('Database Conected with pool');
        connection.release();
    })
    .catch(error => {
        console.log('Error to connect db:', error);
    }
);

module.exports = pool;
