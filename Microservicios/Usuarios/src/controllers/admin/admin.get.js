const { GestionQuejas } = require("../../models/querys/quejas.query");
const { GestionUsuarios } = require("../../models/querys/querys");
// const UserModel = require("../../models/usuario.model");

const getAdminProfile = async (req, res, next) => {
    const userToken = req.user;
    try {
        if (!userToken) {
            const error = new Error('Acceso denegado: No se ha proporcionado token');
            error.statusCode = 401;
            throw error;
        }
        
        const data = await new GestionUsuarios().obtenerPerfilUsuario(userToken.id);
        if(!data.success) return { success: false, data: data.message }
        
        const formatearFecha = (fecha) => {
            return fecha.toISOString().split('T')[0];
        };
        
        const formateoData = {
            ...data.data,
            fecha_nacimiento: formatearFecha(new Date(data.data.fecha_nacimiento)),
            fecha_creacion: formatearFecha(new Date(data.data.fecha_creacion))
        }
        
        return res.status(200).json({ success: true, data: formateoData });
    } catch (err) {
        next(err);
    }
};

const getAdminDash = async (req, res, next) => {
    const userToken = req.user;
    try {
        if(!userToken) {
            const error = new Error('Acceso denegado: No se ha proporcionado token');
            error.statusCode = 401;
            throw error;
        }

        const formatearFecha = (fecha) => {
            return fecha.toISOString().split('T')[0];
        };

        const data = await new GestionUsuarios().buscarUsuarioLogin(userToken.correo);
        const { contrasenia, ...userData } = data.message;

        if(userData.correo_confirmado) {
            const formateoData = {
                ...userData,
                fecha_nacimiento: formatearFecha(new Date(userData.fecha_nacimiento)),
                fecha_creacion: formatearFecha(new Date(userData.fecha_creacion))
            }
            
            return res.status(200).json({ success: true, data: formateoData });
        }
        
        return res.status(200).json({ success: true, data: userData });
    } catch (e) {
        next(e)
    }
};

const changeNewCodeAdmin = async (req, res, next) => {
    const userToken = req.user;
    try {
        if(!userToken) {
            const error = new Error('Acceso denegado: No se ha proporcionado token');
            error.statusCode = 401;
            throw error;
        }
        
        const data = await new GestionUsuarios().reenviarCodigoActivacion(userToken.id);
        // const data = await UserModel.ReenviarCodigoActivacion(userToken.id);
        if(!data.success) {
            const error = new Error(data.message);
            error.statusCode = 402;
            throw error;
        }

        return res.status(201).json({ success: true  })
    } catch (e) {
        next(e);
    }
};

const obtenerUsuariosByAdmin = async (req, res, next) => {
    const adminToken = req.user;
    try {
        if(!adminToken) {
            const error = new Error('Acceso denegado: No se ha proporcionado token');
            error.statusCode = 401;
            throw error;
        }

        const data = await new GestionUsuarios().obtenerUsuariosAdministrador(adminToken.id);
        // const data = await UserModel.AdminObtenerUsuarios(adminToken.id);
        if(!data.success) {
            const error = new Error('Error en la actualización del token');
            error.statusCode = 402;
            throw error;
        }

        return res.status(201).json({ success: true, data: data.data  })
    } catch(e) {
        next(e);
    }
};

const getQuejasUsuarios = async (req, res, next) => {
    try {
        const data = await new GestionQuejas().obtenerQuejasAdmin()
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 401
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

module.exports = {
    getAdminProfile,
    changeNewCodeAdmin,
    getAdminDash,
    obtenerUsuariosByAdmin,
    getQuejasUsuarios,
}