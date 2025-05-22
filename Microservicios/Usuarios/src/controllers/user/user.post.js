const { GestionDescuentosUsuarios } = require("../../models/querys/descuentos_usuarios.query");
const { GestionQuejas } = require("../../models/querys/quejas.query");
const { GestionUsuarios } = require("../../models/querys/querys");
// const UserModel = require("../../models/usuario.model");

const autenticateUser = async (req, res, next) => {
    const userToken = req.user;
    const { code } = req.body;
    try {
        if(!code) {
            const error = new Error('No se ha enviado código de activación');
            error.statusCode = 403;
            throw error;
        }

        if(!userToken) {
            const error = new Error('Acceso denegado: No se ha proporcionado token');
            error.statusCode = 401;
            throw error;
        }

        const data = await new GestionUsuarios().activarCuenta(userToken.id, code);
        // const data = await UserModel.ActivarCuenta(userToken.id, code);
        if(!data.success) {
            const error = new Error(data.message);
            error.statusCode = 401;
            throw error;
        }

        return res.status(201).json({ success: true })
    } catch(e) {
        next(e);
    }
}

const modificarDatosUsuario = async (req, res, next) => {
    const userToken = req.user;
    const { correo, telefono, direcciones } = req.body;

    try {
        // console.log(correo, telefono, direcciones)
        if(!correo || !telefono || direcciones.length === 0) {
            const error = new Error('Datos vacios');
            error.statusCode = 403;
            throw error;
        }

        if(!userToken) {
            const error = new Error('Acceso denegado: No se ha proporcionado token');
            error.statusCode = 401;
            throw error;
        }

        const response = await new GestionUsuarios().modificarDatosUsuario(userToken.id, correo, telefono, direcciones);
        // const response = await UserModel.ModificarUsuarioData(userToken.id, correo, telefono, direcciones);
        if(!response.success) {
            const error = new Error(response.message);
            error.statusCode = 402;
            throw error;
        }

        return res.status(201).json({ success: true })
    } catch(e) {
        next(e);
    }
}

const obtenerDescuentosUsuarioSeleccionado = async (req, res, next) => {
    const usuario = req.user.id
    try {
        const data = await new GestionDescuentosUsuarios().obtenerDescuentosUsuarioSeleccionado(usuario)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const desactivarCupon = async (req, res, next) => {
    const { cupon } = req.body
    try {
        if(!cupon) {
            const error = new Error('No hay cupon')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionDescuentosUsuarios().cuponUsado(cupon)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const nuevaQuejaUsuario = async (req, res, next) => {
    const usuario = req.user.id
    const { tipo, descripcion } = req.body
    try {
        // console.log(usuario, tipo, descripcion)
        if(!tipo || !descripcion) { 
            const error = new Error('Datos incompletos')
            error.statusCode = 401
            throw error
        }

        const data = await new GestionQuejas().nuevaQuejaUsuario(usuario, tipo, descripcion)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 402
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

module.exports = {
    autenticateUser,
    modificarDatosUsuario,
    obtenerDescuentosUsuarioSeleccionado,
    desactivarCupon,
    nuevaQuejaUsuario,
}