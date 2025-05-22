const { GestionDescuentos } = require("../../models/querys/descuentos.query")
const { GestionDescuentosUsuarios } = require("../../models/querys/descuentos_usuarios.query")

const agregarDescuento = async (req, res, next) => {
    const { minimo, maximo, porcentaje } = req.body
    // console.log(minimo, maximo, porcentaje)
    try {
        if(minimo <= 0 ||  maximo <= 0 || maximo <= minimo || porcentaje <= 0) {
            const error = new Error('Datos invalidos')
            error.statusCode = 402
            throw error
        }

        const data = await new GestionDescuentos().agregarDescuento(minimo, maximo, porcentaje)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 401
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const obtenerDescuentos = async (req, res, next) => {
    try {
        const data = await new GestionDescuentos().obtenerDescuentos()
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const modificarDescuento = async (req, res, next) => {
    const { id, minimo, maximo, porcentaje } = req.body
    try {
        if(!id || !minimo || minimo <= 0 || !maximo || maximo <= 0 || maximo <= minimo || !porcentaje) {
            const error = new Error('Datos invalidos')
            error.statusCode = 402
            throw error
        }

        const data = await new GestionDescuentos().modificarDescuento(id, minimo, maximo, porcentaje)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 401
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch (e) { next(e) }
}

const eliminarDescuento = async (req, res, next) => {
    const { id } = req.params
    try {
        if(!id) {
            const error = new Error('ID no valida')
            error.statusCode = 404
            throw error
        }

        const data = await new GestionDescuentos().eliminarDescuento(id)
        if(!data.success) {
            const error = new Error(data.error)
            error.statusCode = 401
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

//- PARTE PARA LO QUE SON DESCUENTOS A LOS USUARIOS
const agregarDescuentoUsuario = async (req, res, next) => {
    const { id_usuario, id_descuento, fecha_asignacion, fecha_caducidad } = req.body
    try {
        if(!id_usuario || !id_descuento || !fecha_asignacion || !fecha_caducidad) {
            const error = new Error('Campos vacios')
            error.statusCode = 402
            throw error
        }

        const data = await new GestionDescuentosUsuarios().agregarDescuentoUsuario(id_usuario, id_descuento, fecha_asignacion, fecha_caducidad)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 401
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e){ next(e) }
}

const generarDescuentoUsuario = async (req, res, next) => {
    const { id_usuario, monto } = req.body
    try {
        if(!id_usuario || !monto || monto <= 0) {
            const error = new Error('Error en la información enviada')
            error.statusCode = 402
            throw error
        }

        const fechaActual = new Date();
        fechaActual.setDate(fechaActual.getDate() + 30);

        const data = await new GestionDescuentosUsuarios().generarDescuentoUsuario(id_usuario, monto, new Date(), fechaActual)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 401
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e){ next(e) }
}

const obtenerDescuentosUsuarios = async (req, res, next) => {
    try {
        const data = await new GestionDescuentosUsuarios().obtenerDescuentosUsuarios()
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const modificarDescuentosUsuarios = async (req, res, next) => {
    const { id_descuento_usuario, id_descuento, fecha_caducidad, activo } = req.body
    try {
        if(!id_descuento_usuario || !id_descuento || !fecha_caducidad) {
            const error = new Error('Campos vacios')
            error.statusCode = 402
            throw error
        }

        const data = await new GestionDescuentosUsuarios().modificarDescuentosUsuarios(id_descuento_usuario, id_descuento, fecha_caducidad, activo)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 401
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e){ next(e) }
}

const eliminarDescuentoUsuario = async (req, res, next) => {
    const { id } = req.params
    try {
        if(!id) {
            const error = new Error('ID no valida')
            error.statusCode = 404
            throw error
        }

        const data = await new GestionDescuentosUsuarios().eliminarDescuentoUsuario(id)
        if(!data.success) {
            const error = new Error(data.error)
            error.statusCode = 401
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

module.exports = {
    agregarDescuento,
    obtenerDescuentos,
    modificarDescuento,
    eliminarDescuento,
    agregarDescuentoUsuario,
    generarDescuentoUsuario,
    obtenerDescuentosUsuarios,
    modificarDescuentosUsuarios,
    eliminarDescuentoUsuario,
}