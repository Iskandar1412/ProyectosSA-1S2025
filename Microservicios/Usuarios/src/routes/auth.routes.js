const express = require('express');
const { registrarUsuario, login, registrarAdministrador, logout, routeToken } = require('../controllers/auth.controller');

const router = express.Router();

// POST
router.post('/register', registrarUsuario);
router.post('/register-admin', registrarAdministrador);
router.post('/login', login);
router.post('/logout', logout);
// router.post('/refresh-token', refreshToken);
router.post('/tokenRoute', routeToken);

// GET

module.exports = router;