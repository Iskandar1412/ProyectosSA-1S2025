const { GestionMarcas } = require("../models/commands/marcas.querys");

const agregarMarca = async (req, res, next) => {
    const user = req.user;
    const { nombre } = req.body;
    try {
        // console.log(user)
        if(!user) {
            const error = new Error('Acceso denegado: No se ha proporcionado token');
            error.statusCode = 401;
            throw error;
        }
        
        if(!nombre) {
            const error = new Error('Datos incompletos');
            error.statusCode = 401;
            error.message = "Nombre de la marca no proporcionado"
            console.log(error.message)
            throw error;
        }

        const data = await new GestionMarcas().agregarMarcas(nombre)
        if(!data.success) {
            const error = new Error(data.message);
            error.statusCode = 403;
            throw error;
        }
        res.status(201).json({ success: true, messsage: 'Marca agregada' })
    } catch (e) { 
        console.log(e.message)
        next(e) }
}

const obtenerMarcas = async (req, res, next) => {
    try {
        const data = await new GestionMarcas().obtenerMarcas()
        if(!data.success) {
            const error = new Error(data.message);
            error.statusCode = 403;
            throw error;
        }

        res.status(201).json({ success: true, message: data.message })
    } catch (e) { next(e) }
}

const eliminarMarca = async (req, res, next) => {
    try {
        const data = await new GestionMarcas().eliminarMarca(req.params.id)
        // console.log(data)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error;
        }

        res.status(201).json({ success: true, message: data.message })
    } catch (e) { next(e) }
}

const actualizarMarca = async (req, res, next) => {
    const { id, nombre } = req.body
    try {
        if(!id || !nombre) {
            const error = new Error("Datos incompletos")
            error.statusCode = 402
            throw error
        }

        const data = await new GestionMarcas().actualizarMarca(id, nombre)

        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch (e) { next(e) }
}

module.exports = {
    agregarMarca,
    obtenerMarcas,
    eliminarMarca,
    actualizarMarca,
}
