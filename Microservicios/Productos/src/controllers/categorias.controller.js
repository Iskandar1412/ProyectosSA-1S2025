const { GestionCategorias } = require("../models/commands/categorias.querys");

const agregarCategoria = async (req, res, next) => {
    const { nombre, descripcion } = req.body;
    try {
        if(!nombre || !descripcion) {
            const error = new Error('Datos incompletos');
            error.statusCode = 401;
            throw error;
        }

        const data = await new GestionCategorias().crearCategoria(nombre, descripcion)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }
        res.status(201).json({ success: true, messsage: 'Categoria agregada' })
    } catch (e) { next(e) }
}

const obtenerCategorias = async (req, res, next) => {
    try {
        const data = await new GestionCategorias().obtenerCategorias()
        if(!data.success) {
            const error = new Error(data.message);
            error.statusCode = 403;
            throw error;
        }

        res.status(201).json({ success: true, message: data.message })
    } catch (e) { next(e) }
}

const eliminarCategoria = async (req, res, next) => {
    try {
        const data = await new GestionCategorias().eliminarCategoria(req.params.id)
        // console.log(data)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error;
        }

        res.status(201).json({ success: true, message: data.message })
    } catch (e) { next(e) }
}

const actualizarCategoria = async (req, res, next) => {
    const { id, nombre, descripcion } = req.body
    try {
        if(!id || !nombre || !descripcion) {
            const error = new Error("Datos incompletos")
            error.statusCode = 402
            throw error
        }

        const data = await new GestionCategorias().actualizarCategoria(id, nombre, descripcion)

        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch (e) { next(e) }
}

module.exports = {
    agregarCategoria,
    obtenerCategorias,
    eliminarCategoria,
    actualizarCategoria,
}