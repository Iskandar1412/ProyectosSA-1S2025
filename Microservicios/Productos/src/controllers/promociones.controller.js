const { GestionPromociones } = require("../models/commands/promociones.query")

const agregarPromocion = async (req, res, next) => {
    const { porcentaje } = req.body
    try {
        if(!porcentaje || porcentaje <= 0) {
            const error = new Error('Valor invalido')
            error.statusCode = 402
            throw error
        }

        const data  = await new GestionPromociones().agregarPromocion(porcentaje)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const modificarPromocion = async (req, res, next) => {
    const { id_promocion, porcentaje } = req.body
    try {
        if(!id_promocion || !porcentaje || porcentaje <= 0) {
            const error = new Error('Valor invalido')
            error.statusCode = 402
            throw error
        }

        const data  = await new GestionPromociones().modificarPromocion(id_promocion, porcentaje)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const obtenerPromociones = async (req, res, next) => {
    try {
        const data  = await new GestionPromociones().obtenerPromociones()
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const eliminarPromocion = async (req, res, next) => {
    const { id } = req.params
    try {
        if(!id) {
            const error = new Error('Valor invalido')
            error.statusCode = 402
            throw error
        }

        const data  = await new GestionPromociones().elminarPromocion(id)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const agregarProductoPromocion = async (req, res, next) => {
    const { id_producto, id_promocion, fecha_inicio, fecha_fin } = req.body
    try {
        if(!id_producto || !id_promocion || !fecha_inicio || !fecha_fin) {
            const error = new Error('Valores invalidos')
            error.statusCode = 402
            throw error
        }

        const data  = await new GestionPromociones().agregarProductoPromocion(id_producto, id_promocion, fecha_inicio, fecha_fin)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const obtenerProductosPromociones = async (req, res, next) => {
    try {
        const data  = await new GestionPromociones().obtenerProductosPromociones()
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        const formatearFecha = (fecha) => {
            return fecha.toISOString().split('T')[0];
        };

        const productosToSend = data.message.map(usuario => {
            return {
                ...usuario,
                fecha_inicio: formatearFecha(new Date(usuario.fecha_inicio)),
                fecha_fin: formatearFecha(new Date(usuario.fecha_fin))
            };
        });
        
        res.status(201).json({ success: true, message: productosToSend })
    } catch(e) { next(e) }
}

const modificarProductoPromocion = async (req, res, next) => {
    const { id_promocion_producto, id_promocion, fecha_inicio, fecha_fin } = req.body
    try {
        if(!id_promocion_producto || !id_promocion || !fecha_inicio || !fecha_fin) {
            const error = new Error('Valores invalidos')
            error.statusCode = 402
            throw error
        }

        const data  = await new GestionPromociones().modificarProductoPromocion(id_promocion_producto, id_promocion, fecha_inicio, fecha_fin)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const eliminarProductoPromocion = async (req, res, next) => {
    const { id } = req.params
    try {
        if(!id) {
            const error = new Error('Valor invalido')
            error.statusCode = 402
            throw error
        }

        const data  = await new GestionPromociones().eliminarProductoPromocion(id)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

module.exports = {
    agregarPromocion,
    modificarPromocion, 
    obtenerPromociones, 
    eliminarPromocion,
    agregarProductoPromocion,
    obtenerProductosPromociones,
    modificarProductoPromocion,
    eliminarProductoPromocion,
}