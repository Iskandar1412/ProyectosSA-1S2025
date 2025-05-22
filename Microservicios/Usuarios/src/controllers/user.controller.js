const { getUserProfile, changeNewCodeUser, getUserDash, obtenerQuejasUsuario } = require("./user/user.get");
const { autenticateUser, modificarDatosUsuario, obtenerDescuentosUsuarioSeleccionado, desactivarCupon, nuevaQuejaUsuario } = require("./user/user.post");

module.exports = {
    getUserProfile,
    autenticateUser,
    changeNewCodeUser,
    getUserDash,
    modificarDatosUsuario,
    obtenerDescuentosUsuarioSeleccionado,
    desactivarCupon,
    nuevaQuejaUsuario,
    obtenerQuejasUsuario,
}