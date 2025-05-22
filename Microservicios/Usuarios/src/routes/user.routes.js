const express = require('express');
const { autenticar } = require('../middleware/auth.middleware');
const { getUserProfile, autenticateUser, changeNewCodeUser, getUserDash, modificarDatosUsuario, obtenerDescuentosUsuarioSeleccionado, desactivarCupon, nuevaQuejaUsuario, obtenerQuejasUsuario } = require('../controllers/user.controller');
const { verifyToken } = require('../controllers/auth/route.token');

const router = express.Router();

// GET
router.get('/user-profile', autenticar, getUserProfile);
router.get('/changeCodeAuthentication', autenticar, changeNewCodeUser); //-
router.get('/user-dash', autenticar, getUserDash);
router.get('/descuentos', autenticar, obtenerDescuentosUsuarioSeleccionado);
router.get('/quejas', autenticar, obtenerQuejasUsuario);

router.get('/validate-token', verifyToken);
// POST
router.post('/autenticate', autenticar, autenticateUser);
router.post('/modify-data-user', autenticar, modificarDatosUsuario);
router.post('/cupon', autenticar, desactivarCupon);
router.post('/quejas', autenticar, nuevaQuejaUsuario);


module.exports = router;