const { GestionFavoritos } = require("../models/commands/favoritos.query")

const agregarQuitarFavorito = async (req, res, next) => {
    const id_usuario = req.user.id
    const { id_producto, correo } = req.body
    try {
        if(!id_usuario || !id_producto || !correo) {
            const error = new Error('Datos no validos')
            error.statusCode = 402
            throw error
        }

        const data = await new GestionFavoritos().agregarQuitar(id_usuario, id_producto, correo)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const obtenerFavoritos = async (req, res, next) => {
    const id = req.user.id
    try {
        if(!id) {
            const error = new Error('Id no valida u existente')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionFavoritos().obtenerFavoritos(id)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 402
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch (e) { next(e) }
}

const notificarProductoBajo = async (req, res, next) => {
    const { carro } = req.body
    try {
        if(!carro || carro.length === 0) {
            const error = new Error('No hay productos para verificar')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionFavoritos().parseoVerProductosFavoritosBajos(carro)
        if (!data.success) {
            const error = new Error(data.message)
            error.statusCode = 402
            throw error
        }
        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const notificarCambioProducto = async (req, res, next) => {
    const { producto } = req.body
    // console.log(producto)
    try {
        if(!producto) {
            const error = new Error('Producto no valido')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionFavoritos().notificarCambioProducto(producto)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }
        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}


module.exports = {
    agregarQuitarFavorito,
    obtenerFavoritos,
    notificarProductoBajo,
    notificarCambioProducto,
}