const express = require('express');
const { isAuthUser, isAdmin } = require('../middleware/auth.middleware');
const { agregarDevolucion, obtenerDevolucionesUsuario, obtenerDevolucionesAdmin, modificarDevolucion, modificarEstadoCuponUsuario, obtenerCuponDevolucionUsuario } = require('../controllers/devoluciones.controller');

const router = express.Router();

// GET
router.get('/devoluciones', isAuthUser, obtenerDevolucionesUsuario)
router.get('/devoluciones/admin', isAuthUser, isAdmin, obtenerDevolucionesAdmin)
router.get('/devoluciones/cupon', isAuthUser, obtenerCuponDevolucionUsuario)

// POST
router.post('/devoluciones', isAuthUser, agregarDevolucion)

// PUT
router.put('/devoluciones', isAuthUser, isAdmin, modificarDevolucion)
router.put('/devoluciones/cupon', isAuthUser, modificarEstadoCuponUsuario)

module.exports = router;