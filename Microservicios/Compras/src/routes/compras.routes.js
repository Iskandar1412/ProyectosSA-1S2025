const express = require('express');
const { isAuthUser, isAdmin } = require('../middleware/auth.middleware');
const { agregarCoprasUsuarios, obtenerComprasAdmin, obtenerComprasUser, modificarEstadoOrden, obtenerHistorial, obtenerHistorialProductosEntregados } = require('../controllers/compras.controller');

const router = express.Router();

// POST
router.get('/compras/admin', isAuthUser, isAdmin, obtenerComprasAdmin)
router.get('/compras', isAuthUser, obtenerComprasUser)
router.get('/historial', isAuthUser, obtenerHistorial)
router.get('/historial-dev', isAuthUser, obtenerHistorialProductosEntregados)

// POST
router.post('/compras', isAuthUser, agregarCoprasUsuarios)

// DELETE
router.put('/compras', isAuthUser, isAdmin, modificarEstadoOrden)

module.exports = router;