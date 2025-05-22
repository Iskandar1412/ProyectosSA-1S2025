require('dotenv').config()

const {
    USUARIOS_MICROSERVICIO_URL,
    JWT_SECRET,
} = process.env;

module.exports = {
    USUARIOS_MICROSERVICIO_URL,
    JWT_SECRET,
}
