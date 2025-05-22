const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../../config/env/auth.config');
const { generarToken } = require('../../utils/token');
const { InicioSesion } = require('../../models');

const routeToken = async (req, res, next) => {
    const { token, refresh } = req.body;
    if(!token && !refresh) {
        const error = new Error('No hay tokens');
        error.statusCode = 401;
        return error;
    }
    // console.log(token !== null, refresh !== null)
    if(token) {
        try {
            const decodificado = jwt.verify(token, JWT_SECRET);
            // console.log(decodificado)
            req.user = decodificado;
            return res.status(200).json({ success: true, user: decodificado });
        } catch (e) {
            const error = new Error('Token invalido');
            error.statusCode = 403;
            next(error)
        }
    }

    if (refresh) {
        try {
            const refreshDecode = jwt.verify(refresh, JWT_REFRESH_SECRET);
            // console.log(refreshDecode)
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

            // res.setHeader('authorization', newAccessToken)
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

            return res.status(200).json({ success: true, user: refreshDecode, token: newAccessToken });
        } catch (e) {
            return res.status(403).json({ success: false, message: e.message})
            // console.error("Error verificando Refresh Token:", e.message);
            // e.statusCode = 403
            // next(e)
            // return res.status(403).json({ success: false, message: 'Refresh Token inválido o expirado, inicie sesión nuevamente' });
        }
    }
    return res.status(403).json({ success: false, message: 'token invalido'})
    // const error = new Error('Error de token invalido')
    // error.statusCode = 401
    // next(error)
    // return res.status(401).json({ success: false, message: 'Token inválido o sesión terminada' });
};


const verifyToken = async (req, res, next) => {
    // const token = req.cookies.token;
    // const refresh = req.cookies.refresh;
    const token = req.headers['authorization'];
    const refresh = req.headers['refresh'];

    if(!token && !refresh) {
        return res.status(401).json({ success: false, message: 'No hay tokens, inicie sesión nuevamente' });
    }

    if(token) {
        try {
            const decodificado = jwt.verify(token, JWT_SECRET);
            req.user = decodificado;
            return res.status(200).json({ success: true, user: decodificado });
        } catch (e) {
            console.log("Access Token expirado. Renovando...");
        }
    }

    if (refresh) {
        try {
            const refreshDecode = jwt.verify(refresh, JWT_REFRESH_SECRET);
            const usuario = await Usuario.findOne({
                where: {
                    id: refreshDecode.id,
                    refresh_token: refresh
                }
            });
            
            if(!usuario) {
                return res.status(403).json({ success: false, message: 'Refresh Token inválido o sesión terminada' });
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

            return res.status(200).json({ success: true, user: refreshDecode, token: newAccessToken});
        } catch (e) {
            console.error("Error verificando Refresh Token:", e.message);
            return res.status(403).json({ success: false, message: 'Refresh Token inválido o expirado, inicie sesión nuevamente' });
        }
    }
    return res.status(401).json({ success: false, message: 'Token inválido o sesión terminada' });
};

module.exports = {
    routeToken,
    verifyToken
}