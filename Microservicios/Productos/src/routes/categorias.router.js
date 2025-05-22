const express = require('express');
const { isAuthUser, isAdmin } = require('../middleware/auth.middleware');
const { agregarCategoria, obtenerCategorias, eliminarCategoria, actualizarCategoria } = require('../controllers/categorias.controller');

const router = express.Router();


// GETS
router.get('/categorias', obtenerCategorias)

// POSTS
router.post('/categorias', isAuthUser, agregarCategoria)

// PUTS
router.put('/categorias', isAuthUser, isAdmin, actualizarCategoria)

// DELETES
router.delete('/categorias/:id', isAuthUser, isAdmin, eliminarCategoria)


module.exports = router;