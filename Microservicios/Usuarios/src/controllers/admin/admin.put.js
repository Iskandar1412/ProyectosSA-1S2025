const { GestionQuejas } = require("../../models/querys/quejas.query")

const modificarEstadoQUeja = async (req, res, next) => {
    const { id_queja, estado } = req.body
    try {
        if(!id_queja || !estado) {
            const error = new Error('Datos invalidos')
            error.statusCode = 402
            throw error
        }

        const data = await new GestionQuejas().modificarEstadoQueja(id_queja, estado)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

module.exports = {
    modificarEstadoQUeja
}