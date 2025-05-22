const express = require('express');
const { isAuthUser, isAdmin } = require('../middleware/auth.middleware');
const { agregarMarca, obtenerMarcas, eliminarMarca, actualizarMarca } = require('../controllers/marcas.controller');

const router = express.Router();

// GETS
router.get('/marcas', obtenerMarcas)

// POSTS
router.post('/marcas', isAuthUser, agregarMarca)

// PUTS
router.put('/marcas', isAuthUser, isAdmin, actualizarMarca)

// DELETES
router.delete('/marcas/:id', isAuthUser, isAdmin, eliminarMarca)

module.exports = router;