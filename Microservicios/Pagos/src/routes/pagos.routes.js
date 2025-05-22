const express = require('express');
const { isAuthUser, isAdmin } = require('../middleware/auth.middleware');
const { obtenerPagoUsuario, obtenerPagoAdministrador, agregarPago } = require('../controllers/pagos.controller');


const router = express.Router();


// GETS
router.get('/pagos', isAuthUser, obtenerPagoUsuario)
router.get('/pagos/admin', isAuthUser, isAdmin, obtenerPagoAdministrador)

// POST
router.post('/pagos', isAuthUser, agregarPago)


// PUT


// DELETE


module.exports = router