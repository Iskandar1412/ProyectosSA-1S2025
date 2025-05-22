const express = require('express');
const { isAuthUser, isAdmin } = require('../middleware/auth.middleware');
const { agregarProducto, obtenerProductos, obtenerProductosAdmin, eliminarProducto, actualizarProducto, obtenerProductosPorFiltro, obtenerRegiones, agregarRegionesProductos, restarProductoPorCompra } = require('../controllers/productos.controller');

const router = express.Router();

// GETS
router.get('/regiones', obtenerRegiones)
router.get('/productos', obtenerProductos)
router.get('/productos/filter', obtenerProductosPorFiltro)
router.get('/productos/admin', isAuthUser, isAdmin, obtenerProductosAdmin)

// POSTS
router.post('/productos', isAuthUser, agregarProducto)
router.post('/productos/regiones', isAuthUser, agregarRegionesProductos)
router.post('/productos/actualizar', isAuthUser, restarProductoPorCompra)

// PUTS
router.put('/productos', isAuthUser, isAdmin, actualizarProducto)

// DELETES
router.delete('/productos/:id', isAuthUser, isAdmin, eliminarProducto)



module.exports = router;