require('../models');
const { registrarUsuario, registrarAdministrador } = require('./auth/auth.registro');
const { login, logout } = require('./auth/auth.sesion');
const refreshToken = require('./auth/auth.token');
const { routeToken } = require('./auth/route.token');

module.exports = {
    registrarUsuario,
    registrarAdministrador,
    login,
    logout,
    refreshToken,
    routeToken,
};