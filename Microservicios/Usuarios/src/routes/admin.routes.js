const express = require('express');
const { autenticar, isAdmin } = require('../middleware/auth.middleware');
const { autenticateAdmin, getAdminDash, getAdminProfile, changeNewCodeAdmin, modificarDatosAdmin, obtenerUsuariosByAdmin, actualizarEstadoUsuario, agregarDescuento, obtenerDescuentos, modificarDescuento, eliminarDescuento, generarDescuentoUsuario, agregarDescuentoUsuario, obtenerDescuentosUsuarios, modificarDescuentosUsuarios, eliminarDescuentoUsuario, getQuejasUsuarios, modificarEstadoQUeja } = require('../controllers/admin.controller');

const router = express.Router();

// GET
router.get('/admin-profile', autenticar, isAdmin, getAdminProfile);
router.get('/changeCodeAuthentication', autenticar, isAdmin, changeNewCodeAdmin); ///-
router.get('/admin-dash', autenticar, isAdmin, getAdminDash);
router.get('/get-users', autenticar, isAdmin, obtenerUsuariosByAdmin);

// POST
router.post('/autenticate', autenticar, isAdmin, autenticateAdmin);
router.post('/modify-data-admin', autenticar, isAdmin, modificarDatosAdmin);
router.post('/actualizar-estado', autenticar, isAdmin, actualizarEstadoUsuario);

// PARTE DESCUENTOS
//- POST
router.post('/descuentos', autenticar, isAdmin, agregarDescuento);
router.post('/descuentos/usuario', autenticar, isAdmin, agregarDescuentoUsuario);
router.post('/descuentos/usuario/generado', autenticar, generarDescuentoUsuario);

//- GET
router.get('/descuentos', autenticar, isAdmin, obtenerDescuentos);
router.get('/descuentos/usuario', autenticar, isAdmin, obtenerDescuentosUsuarios);
router.get('/quejas', autenticar, isAdmin, getQuejasUsuarios);

//- PUT
router.put('/descuentos', autenticar, isAdmin, modificarDescuento);
router.put('/descuentos/usuario', autenticar, isAdmin, modificarDescuentosUsuarios);
router.put('/quejas', autenticar, isAdmin, modificarEstadoQUeja);

//- DELETE
router.delete('/descuentos/:id', autenticar, isAdmin, eliminarDescuento);
router.delete('/descuentos/usuario/:id', autenticar, isAdmin, eliminarDescuentoUsuario);

module.exports = router;