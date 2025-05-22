const express = require('express');
const { isAuthUser, isAdmin } = require('../middleware/auth.middleware');
const { agregarPromocion, obtenerPromociones, modificarPromocion, eliminarPromocion, obtenerProductosPromociones, agregarProductoPromocion, modificarProductoPromocion, eliminarProductoPromocion } = require('../controllers/promociones.controller');

const router = express.Router();

// GETS
router.get('/promociones', isAuthUser, isAdmin, obtenerPromociones)
router.get('/promociones/producto', isAuthUser, isAdmin, obtenerProductosPromociones)

// POSTS
router.post('/promociones', isAuthUser, isAdmin, agregarPromocion)
router.post('/promociones/producto', isAuthUser, isAdmin, agregarProductoPromocion)

// PUTS
router.put('/promociones', isAuthUser, isAdmin, modificarPromocion)
router.put('/promociones/producto', isAuthUser, isAdmin, modificarProductoPromocion)

// DELETES
router.delete('/promociones/:id', isAuthUser, isAdmin, eliminarPromocion)
router.delete('/promociones/producto/:id', isAuthUser, isAdmin, eliminarProductoPromocion)


module.exports = router;