const { GestionImagenes } = require("../models/commands/imagenes.querys")

const agregarImagen = async (req, res, next) => {
    const { id_producto, imagen } = req.body
    try {
        if(!id_producto || !imagen) {
            const error = new Error('Valores vacios')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionImagenes().agregarImagen(id_producto, imagen)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 404
            throw error
        }

        res.status(201).json({ success: true, message: 'Imagen subida exitosamente' })
    } catch(e) { next(e) }
}

const eliminarImagen = async (req, res, next) => {
    const { id } = req.params;
    try {
        if(!id) {
            const error = new Error('No hay id de imagen')
            error.statusCode = 402
            throw error
        }

        const data = await new GestionImagenes().eliminarImagen(id)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 402
            throw error
        }

        res.status(201).json({ success: true, message: 'Exito al agregar la imagen' })
    } catch (e) { next(e) }
}

module.exports = {
    agregarImagen,
    eliminarImagen,
}