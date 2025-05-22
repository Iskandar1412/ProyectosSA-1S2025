const { agregarDescuento, modificarDescuento, obtenerDescuentos, eliminarDescuento, generarDescuentoUsuario, agregarDescuentoUsuario, obtenerDescuentosUsuarios, modificarDescuentosUsuarios, eliminarDescuentoUsuario, obtenerDescuentosUsuarioSeleccionado } = require("./admin/admin.descuentos");
const { getAdminProfile, changeNewCodeAdmin, getAdminDash, obtenerUsuariosByAdmin, getQuejasUsuarios } = require("./admin/admin.get");
const { autenticateAdmin, modificarDatosAdmin, actualizarEstadoUsuario } = require("./admin/admin.post");
const { modificarEstadoQUeja } = require("./admin/admin.put");

module.exports = {
    getAdminProfile,
    autenticateAdmin,
    changeNewCodeAdmin,
    getAdminDash,
    modificarDatosAdmin,
    obtenerUsuariosByAdmin,
    actualizarEstadoUsuario,
    agregarDescuento,
    modificarDescuento,
    obtenerDescuentos,
    eliminarDescuento,
    generarDescuentoUsuario,
    agregarDescuentoUsuario,
    obtenerDescuentosUsuarios,
    modificarDescuentosUsuarios,
    eliminarDescuentoUsuario,
    getQuejasUsuarios,
    modificarEstadoQUeja,
}