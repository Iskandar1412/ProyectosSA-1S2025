const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRATION, JWT_REFRESH_EXPIRATION } = require('../config/env/auth.config');

const generarToken = (user) => {
    return jwt.sign({ id: user.id, correo: user.correo, rol: user.rol }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

const refrescarToken = (user) => {
    return jwt.sign({ id:  user.id, correo: user.correo, rol: user.rol }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION });
};

module.exports = { generarToken, refrescarToken };