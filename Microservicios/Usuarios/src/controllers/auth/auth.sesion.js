// const { read } = require('fs');
const { GestionUsuarios } = require('../../models/querys/querys');
// const UserModel = require('../../models/usuario.model');
const { generarToken, refrescarToken } = require('../../utils/token');
const bcrypt = require('bcrypt');

const login = async(req, res, next) => {
    const { credentials, contrasenia } = req.body;
    
    try {
        if(!credentials || !contrasenia) {
            const error = new Error('Credenciales y Contraseñas requeridos');
            error.statusCode = 400;
            throw error;
        }

        const usuario = await new GestionUsuarios().buscarUsuarioLogin(credentials);
        // const usuario = await UserModel.BuscarUsuario(credentials);
        if(!usuario.success) {
            const error = new Error(usuario.message);
            error.statusCode = 404;
            throw error;
        }
        // console.log(usuario)
        const passValida = await bcrypt.compare(contrasenia, usuario.message.contrasenia);
        if(!passValida) {
            const error = new Error('Credenciales invalidas');
            error.statusCode = 401;
            throw error;
        }
        
        // console.log({ id: usuario.message.id_usuario, correo: usuario.message.correo, rol: usuario.message.rol })
        const token = generarToken({ id: usuario.message.id_usuario, correo: usuario.message.correo, rol: usuario.message.rol });
        const refrescarTok = refrescarToken({ id: usuario.message.id_usuario, correo: usuario.message.correo, rol: usuario.message.rol });
    
        // const ref = await UserModel.AgregarTokenUsuario(credentials, refrescarTok);
        const ref = await new GestionUsuarios().inicioSesionUsuario(usuario.message.id_usuario, refrescarTok);
        // console.log(ref)
        if (!ref.success) {
            const error = new Error('Error en agregar token');
            error.statusCode = 402;
            throw error;
        }

        res.setHeader('authorization', token)
        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: false, // https
        //     // maxAge: 1000 * 60 * 15, // 15m
        //     expires: new Date(Date.now() + 1000 * 60 * 5), // 6m
        //     sameSite: 'Lax'
        // });
            
        res.setHeader('refresh', refrescarTok)
        // res.cookie('refresh', refrescarTok, {
        //     httpOnly: true,
        //     secure: false, // https
        //     expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 8d
        //     sameSite: 'Lax'
        // });

        res.status(200).json({ success: true, message: 'Loggin successful', rol: usuario.message.rol, token: token, refresh: refrescarTok });
    } catch(e) {
        console.log('Error login', e)
        next(e);
    }
};

const logout = async(req, res, next) => {
    const refresh = req.headers['refresh'];
    try {
        if(refresh) {
            const response = await new GestionUsuarios().cierreSesionUsuario(refresh);
            // const response = await UserModel.EliminarTokenUsuario(refresh);
            if(!response.success) {
                const error = new Error('Token no valido');
                error.statusCode = 403;
                throw error;
            }
        } else {
            return res.status(401).json({ success: false, message: 'No se proporcionó token de refresh' });
        }

        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'Lax'
        });

        res.clearCookie('refresh', {
            httpOnly: true,
            sameSite: 'Lax'
        });
    
        return res.status(200).json({ success: true, message: 'Logout exitoso'});

    } catch(e) {
        next(e)
    }
}

module.exports = {
    login,
    logout
};