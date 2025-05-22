const { GestionUsuarios } = require("../../models/querys/querys");
// const UserModel = require("../../models/usuario.model");

const registrarAdministrador = async(req, res, next) => {
    const { p_nombre, p_apellido, p_correo, p_username, p_telefono, p_genero, p_fecha_nacimiento, p_imagen, p_contrasenia, p_ciudad, p_departamento } = req.body;
    
    try {
        if(!p_nombre || !p_apellido || !p_correo || !p_username || !p_telefono || !p_genero || !p_fecha_nacimiento || !p_contrasenia || !p_ciudad || !p_departamento) {
            const error = new Error('Campos requeridos');
            error.statusCode = 400;
            throw error;
        }

        const usuarioID = await new GestionUsuarios().crearAdministrador(p_nombre, p_apellido, p_correo, p_username, p_telefono, p_genero, p_fecha_nacimiento, p_imagen, p_contrasenia, p_ciudad, p_departamento);
        if (!usuarioID.success) {
            const error = new Error(usuarioID.message);
            error.statusCode = 503;
            throw error;
        }

        res.status(201).json({ success: true, message: 'Administrador registrado exitosamente', usuarioID });
    } catch(e) {
        next(e);
    }
}

const registrarUsuario = async(req, res, next) => {
    const { p_nombre, p_apellido, p_correo, p_username, p_telefono, p_genero, p_fecha_nacimiento, p_imagen, p_contrasenia, p_ciudad, p_departamento } = req.body;
    
    try {
        if(!p_nombre || !p_apellido || !p_correo || !p_username || !p_telefono || !p_genero || !p_fecha_nacimiento || !p_contrasenia || !p_ciudad || !p_departamento) {
            const error = new Error('Campos requeridos');
            error.statusCode = 400;
            throw error;
        }
        
        const usuarioID = await new GestionUsuarios().crearUsuario(p_nombre, p_apellido, p_correo, p_username, p_telefono, p_genero, p_fecha_nacimiento, p_imagen, p_contrasenia, p_ciudad, p_departamento);
        if (!usuarioID.success) {
            const error = new Error(usuarioID.message);
            error.statusCode = 503;
            throw error;
        }
        
        res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', usuarioID });
    } catch(e) {
        next(e);
    }
}

module.exports = {
    registrarAdministrador,
    registrarUsuario
};