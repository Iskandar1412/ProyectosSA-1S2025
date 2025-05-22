const { GestionPagos } = require("../models/commands/pagos.query")

const agregarPago = async (req, res, next) => {
    const usuarioid = req.user.id
    const { id_compra, usuario, tipo_pago_1, no_tarjeta_1, porcentaje_1, tipo_pago_2, no_tarjeta_2, porcentaje_2, subtotal, cupon_descuento, total } = req.body
    try {
        // console.log(usuarioid, id_compra, usuario, tipo_pago_1, no_tarjeta_1, porcentaje_1, tipo_pago_2, no_tarjeta_2, porcentaje_2, subtotal, cupon_descuento, total)
        if(!usuarioid || !id_compra || !usuario || !tipo_pago_1 || !no_tarjeta_1 || no_tarjeta_1 <= 0 || !porcentaje_1 || !tipo_pago_2 || porcentaje_2 < 0 || subtotal < 0 || cupon_descuento < 0 || total < 0) {
            const error = new Error('Datos erroneos')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionPagos().agregarPago(id_compra, usuarioid, usuario, tipo_pago_1, no_tarjeta_1, porcentaje_1, tipo_pago_2, no_tarjeta_2, porcentaje_2, subtotal, cupon_descuento, total)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const obtenerPagoUsuario = async(req, res, next) => {
    const usuarioid = req.user.id
    try {
        if(!usuarioid) {
            const error = new Error('Datos erroneos')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionPagos().obtenerPagosUsuario(usuarioid)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const obtenerPagoAdministrador = async(req, res, next) => {
    try {
        const data = await new GestionPagos().obtenerPagosAdmin()
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

module.exports = {
    agregarPago,
    obtenerPagoUsuario,
    obtenerPagoAdministrador,
}