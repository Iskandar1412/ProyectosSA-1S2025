const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/env/auth.config');
const { generarToken } = require('../utils/token');
const { InicioSesion } = require('../models');

// Verificación del jwt para el acceso a rutas protegidas
const autenticar = async (req, res, next) => {
    const token = req.headers['authorization'];
    const refresh = req.headers['refresh'];

    // console.log(token, refresh)
    if(!token && !refresh) {
        const error = new Error('No hay tokens');
        error.statusCode = 401;
        return error;
    }

    if(token) {
        try {
            const decodificado = jwt.verify(token, JWT_SECRET);
            req.user = decodificado;
            return next();
        } catch (e) {
            const error = new Error('Token invalido');
            error.statusCode = 403;
            next(error)
        }
    }

    if (refresh) {
        try {
            const refreshDecode = jwt.verify(refresh, JWT_REFRESH_SECRET);
            const usuario = await InicioSesion.findOne({
                where: {
                    id_usuario: refreshDecode.id,
                    refresh_token: refresh
                }
            });
            
            if(!usuario) {
                const error = new Error('Refresh token invalido');
                error.statusCode = 403;
                throw error;
            }

            console.log('Usuario con autenticación, Generando access token');
            const newAccessToken = generarToken({
                id: refreshDecode.id,
                correo: refreshDecode.correo,
                rol: refreshDecode.rol
            });

            res.setHeader('authorization', newAccessToken)
            // res.cookie('token', newAccessToken, {
            //     httpOnly: true,
            //     secure: false, // https
            //     // maxAge: 1000 * 60 * 15, // 15m
            //     expires: new Date(Date.now() + 1000 * 60 * 5), // 6m
            //     sameSite: 'Lax'
            // });

            req.user = {
                id: refreshDecode.id,
                correo: refreshDecode.correo,
                rol: refreshDecode.rol
            };
            // console.log(req.user)
            // console.log("Token enviado", newAccessToken);

            return next();
        } catch (e) {
            next(e);
        }
    }
};

const isAdmin = (req, res, next) => {
    if(req.user.rol !== 'admin') {
        const error = new Error('Acceso denegado: No hay permisos de administrador');
        error.statusCode = 403;
        return next(error);
    }

    next();
}

module.exports = { autenticar, isAdmin };