const express = require('express');
const { isAuthUser } = require('../middleware/auth.middleware');
const { agregarImagen, eliminarImagen } = require('../controllers/imagenes.controller');

const router = express.Router();

// POST
router.post('/imagenes', isAuthUser, agregarImagen)

// DELETE
router.delete('/imagenes/:id', isAuthUser, eliminarImagen)


module.exports = router;