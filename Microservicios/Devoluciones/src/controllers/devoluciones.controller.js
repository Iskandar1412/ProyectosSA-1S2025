const { GestionDevoluciones } = require("../models/commands/devoluciones.query")

const agregarDevolucion = async (req, res, next) => {
    const usuarioid = req.user.id
    const { correo_usuario, id_producto, codigo_producto, fecha, cantidad, motivo_devolucion, precio_producto } = req.body
    try {
        if(!correo_usuario || !id_producto || !codigo_producto || !fecha || !cantidad || !motivo_devolucion || !precio_producto || !usuarioid) {
            const error = new Error('Datos no validos')
            error.statusCode = 403
            throw error
        }

        const fechaPedido = new Date(fecha).getTime();
        const fechaExpiracion = new Date(fechaPedido);
        fechaExpiracion.setDate(fechaExpiracion.getDate() + 30);

        const fechaActual = new Date().getTime();

        if (fechaActual > fechaExpiracion.getTime()) {
            const error = new Error('La solicitud ha expirado (límite: 30 días después del pedido)');
            error.statusCode = 402;
            throw error;
        }

        const data = await new GestionDevoluciones().agregarDevolucion(usuarioid, correo_usuario, id_producto, codigo_producto, cantidad, motivo_devolucion, precio_producto)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const obtenerDevolucionesUsuario = async (req, res, next) => {
    const  usuarioID = req.user.id
    try {
        if(!usuarioID) {
            const error = new Error('Usuario no valido')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionDevoluciones().devolucionesUsuario(usuarioID)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const obtenerDevolucionesAdmin = async (req, res, next) => {
    try {
        const data = await new GestionDevoluciones().devolucionesAdmin()
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const modificarDevolucion = async (req, res, next) => {
    const { id_devolucion, estado } = req.body
    try {
        if(!id_devolucion || !estado) {
            const error = new Error('Datos no validos')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionDevoluciones().modificarDevolucion(id_devolucion, estado)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }
        
        let mensaje
        if(estado === 'ACEPTADO') {
            const response = await new GestionDevoluciones().generarCuponValorProductoUsuario(id_devolucion, data.message.precio_total, data.message.correo_usuario)
            if(!response.success) {
                const error = new Error(response.message)
                error.statusCode = 403
                throw error
            }
            mensaje = response.message
        }

        res.status(201).json({ success: true, message: mensaje })
    } catch(e) { next(e) }
}

const obtenerCuponDevolucionUsuario = async (req, res, next) => {
    const usuarioID = req.user.id;
    try {
        if(!usuarioID) {
            const error = new Error('Datos incorrectos')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionDevoluciones().obtenerCuponDevolucionUsuario(usuarioID)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const modificarEstadoCuponUsuario = async (req, res, next) => {
    const { id, id_devolucion, valor, correo, sub_total } = req.body
    try {
        if(!id || !id_devolucion|| !valor || !correo || !sub_total) {
            const error = new Error('Error valor no admitido')
            error.statusCode = 403
            throw error
        }

        let devolucion = 0
        if(Number(valor) >= Number(sub_total)) {
            devolucion = Number(valor) - Number(sub_total)
        }

        const data = await new GestionDevoluciones().modificarEstadoCuponUsuario(id)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        if(devolucion !== 0) {
            const data2 = await new GestionDevoluciones().crearOtroCuponDiferencia(id_devolucion, devolucion, correo)
            if(!data2.success) {
                const error = new Error(data2.message)
                error.statusCode = 403
                throw error
            }
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

module.exports = {
    agregarDevolucion,
    obtenerDevolucionesUsuario,
    obtenerDevolucionesAdmin,
    modificarDevolucion,
    obtenerCuponDevolucionUsuario,
    modificarEstadoCuponUsuario,
}