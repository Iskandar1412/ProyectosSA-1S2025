const { GestionUsuarios } = require("../../models/querys/querys");
// const UserModel = require("../../models/usuario.model");

const autenticateAdmin = async (req, res, next) => {
    const adminToken = req.user;
    const { code } = req.body;
    try {
        if(!code) {
            const error = new Error('No se ha enviado código de activación');
            error.statusCode = 403;
            throw error;
        }

        if(!adminToken) {
            const error = new Error('Acceso denegado: No se ha proporcionado token');
            error.statusCode = 401;
            throw error;
        }

        const data = await new GestionUsuarios().activarCuenta(adminToken.id, code);
        // const data = await UserModel.ActivarCuenta(adminToken.id, code);
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

const modificarDatosAdmin = async (req, res, next) => {
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

const actualizarEstadoUsuario = async (req, res, next) => {
    const user = req.user;
    const { id, usuario_activo } = req.body;
    // console.log(user, id, usuario_activo)
    try {
        if(!id) {
            const error = new Error('Datos vacios');
            error.statusCode = 403;
            throw error;
        }

        if(!user) {
            const error = new Error('Acceso denegado: No se ha proporcionado token');
            error.statusCode = 401;
            throw error;
        }
        const response = await new GestionUsuarios().modificarActivoUsuario(user.id, id, usuario_activo);
        // const response = await UserModel.modificarEstadoByAdmin(user.id, id, usuario_activo);
        if(!response.success) {
            const error = new Error(response.message);
            error.statusCode = 402;
            throw error;
        }

        return res.status(201).json({ success: true })
    } catch(e) {
        next(e)
    }
}

module.exports = {
    autenticateAdmin,
    modificarDatosAdmin,
    actualizarEstadoUsuario,
}