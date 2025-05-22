const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env/auth.config');
const { refrescarToken } = require('../../utils/token');

const refreshToken = async (req, res, next) => {
    // const { token } = req.cookies;
    const token = req.headers['authorization'];
    // const refresh = req.headers['refresh'];

    try {
        if(!token) {
            const error = new Error('Token no existente');
            error.statusCode = 401;
            throw error;
        }

        const decodificar = jwt.verify(token, JWT_SECRET);
        const tokenRefrescado = refrescarToken({ id: decodificar.id, email: decodificar.email, rol: decodificar.rol });

        res.setHeader('authorization', tokenRefrescado)
        // res.cookie('token', tokenRefrescado, {
        //     httpOnly: true,
        //     maxAge: 1000 * 60 * 60,
        //     sameSite: 'Lax'
        // });

        res.status(200).json({ success: true, message: 'Token refrescado exitosamente', token: tokenRefrescado });
    } catch(e) {
        next(e)
    }
}

module.exports = refreshToken;