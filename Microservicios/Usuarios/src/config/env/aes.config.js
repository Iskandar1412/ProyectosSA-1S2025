require('dotenv').config();

const { AES_KEY, AES_IV } = process.env;

module.exports = { AES_KEY, AES_IV };
