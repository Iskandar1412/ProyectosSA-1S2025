
require('dotenv').config();

const {
  DATABASE_HOST,
  DATABASE_MYSQL_USER,
  DATABASE_MYSQL_PASSWORD,
  DATABASE_PORT,
  TABLE_USUARIOS
} = process.env;

module.exports = {
  DATABASE_HOST,
  DATABASE_MYSQL_USER,
  DATABASE_MYSQL_PASSWORD,
  DATABASE_PORT,
  TABLE_USUARIOS
};
