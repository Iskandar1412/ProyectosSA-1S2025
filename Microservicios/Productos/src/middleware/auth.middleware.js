const { USUARIOS_MICROSERVICIO_URL } = require('../config/env/token.config');

const isAuthUser = async (req, res, next) => {
    // const cookie = req.cookies;
    const token = req.headers['authorization'] || null;
    const refresh = req.headers['refresh'] || null;
    
    try {
        if(!token && !refresh) {
            const error = new Error("Token expirado o no valido")
            error.statusCode = 503;
            error.message = "Token no proporcionado"
            throw error
        }
        
        const response = await fetch(`${USUARIOS_MICROSERVICIO_URL}/auth/tokenRoute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: token, refresh: refresh })
            }
        );

        const data = await response.json();
        if(!response.ok) {
            const error = new Error("Error en la peticion")
            error.statusCode = 504;
            error.message = "Error en la peticion al microservicio de usuarios"
            throw error;
        }

        if(!data.success) {
            const error = new Error('Error en la obtención de tokens');
            error.statusCode = 502;
            error.message = "Error en la obtención de tokens del microservicio de usuarios"
            throw error;
        }

        // console.log(data)
        req.user = {
            id: data.user.id,
            correo: data.user.correo,
            rol: data.user.rol
        };
        return next();
    } catch(e) {
        console.log(e.message)	
        next(e)
    }
}

const isAdmin = async (req, res, next) => {
    if(req.user.rol !== 'admin') {
        const error = new Error('Acceso denegado: No tiene permisos de administrador')
        error.statusCode = 403
        return next(error)
    }
    next();
}


module.exports = {
    isAuthUser,
    isAdmin
}