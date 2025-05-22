const express = require('express');
const { isAuthUser, isAdmin } = require('../middleware/auth.middleware');
const { obtenerFavoritos, agregarQuitarFavorito, notificarProductoBajo, notificarCambioProducto } = require('../controllers/favoritos.controller');


const router = express.Router();


// GETS
router.get('/favoritos', isAuthUser, obtenerFavoritos)

// POST
router.post('/favoritos', isAuthUser, agregarQuitarFavorito)
router.post('/notificar', isAuthUser, notificarProductoBajo)
router.post('/cambios', isAuthUser, isAdmin, notificarCambioProducto)


// PUT


// DELETE


module.exports = router
