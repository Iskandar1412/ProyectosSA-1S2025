const { GestionProductos } = require("../models/commands/productos.querys");

const agregarProducto = async (req, res, next) => {
    const { id_categoria, id_marca, nombre, descripcion, precio, cantidad, disponibilidad, valor } = req.body
    const id_usuario = req.user.id
    try {
        if (
            id_categoria == null ||
            id_marca == null ||
            !nombre ||
            !descripcion ||
            precio == null ||
            cantidad == null ||
            disponibilidad === undefined ||
            valor === undefined
          ) {
            console.log(id_usuario, id_categoria, id_marca, nombre, descripcion, precio, cantidad, disponibilidad, valor);
            const error = new Error('Datos incompletos');
            error.statusCode = 401;
            throw error;
          }

        const data = await new GestionProductos().crearProducto(id_categoria, id_marca, id_usuario, nombre, descripcion, precio, cantidad, disponibilidad, valor)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(201).json({ success: true, messsage: 'Producto agregado' })
    } catch (e) { 
        console.log(e)
        next(e) }
}

const obtenerProductos = async (req, res, next) => {
    try {
        const data = await new GestionProductos().obtenerProductos()
        if(!data.success) {
            const error = new Error(data.message);
            error.statusCode = 403;
            throw error;
        }

        res.status(201).json({ success: true, message: data.message })
    } catch (e) { next(e) }
}

const obtenerProductosAdmin = async (req, res, next) => {
    try {
        const data = await new GestionProductos().obtenerProductosAdmin()
        if(!data.success) {
            const error = new Error(data.message);
            error.statusCode = 403;
            throw error;
        }

        res.status(201).json({ success: true, message: data.message })
    } catch (e) { next(e) }
}

const eliminarProducto = async (req, res, next) => {
    try {
        const data = await new GestionProductos().eliminarProducto(req.params.id)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403;
            throw error
        }

        res.status(201).json({ success: true, message: 'Producto eliminado exitosamente' })
    } catch(e) { next(e) }
}

const actualizarProducto = async (req, res, next) => {
    const { id_producto, id_categoria, id_marca, nombre, descripcion, precio, cantidad, disponibilidad, valor } = req.body
    try {
        if(!id_producto || !id_categoria || !id_marca || !nombre || !descripcion || !precio || precio <= 0  || !cantidad || cantidad <= 0 || !valor) {
            const error = new Error('Faltan datos para modificar producto')
            error.statusCode = 400
            throw error
        }

        const data = await new GestionProductos().actualizarProducto(id_producto, id_categoria, id_marca, nombre, descripcion, precio, cantidad, disponibilidad, valor)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 403
            throw error
        }

        res.status(202).json({ success: true, message: 'Producto actualizado exitosamente' })
    } catch(e) { next(e) }
}

const obtenerProductosPorFiltro = async (req, res, next) => {
    const { filtro, parametros } = req.query
    try {
        if (!filtro && !parametros) {
            return obtenerProductos(req, res)
        }

        if(filtro === 'Categoría' && !parametros) {
            const error = new Error('Se requieren categorias')
            error.statusCode = 400
            throw error
        }

        if(filtro === 'Por rango de precio' && !parametros) {
            const error = new Error('Se requiere un rango de precio')
            error.statusCode = 400
            throw error
        }

        if(filtro === 'Productos por marca' && !parametros) {
            const error = new Error('Se requiere una marca')
            error.statusCode = 400
            throw error
        }

        if(filtro === 'Categoría') {
            const data = await new GestionProductos().productoXCategoria(parametros)
            if(!data.success) {
                const error = new Error(data.message)
                error.statusCode = 403
                throw error
            }

            res.status(201).json({ success: true, data: data.data })
        } else if(filtro === 'Productos por marca') {
            const data = await new GestionProductos().productoXMarca(parametros)
            if(!data.success) {
                const error = new Error(data.message)
                error.statusCode = 403
                throw error
            }

            res.status(201).json({ success: true, data: data.data })
        } else if(filtro === 'Por rango de precio') {
            const data = await new GestionProductos().productoXRangoPrecio(parametros)
            if(!data.success) {
                const error = new Error(data.message)
                error.statusCode = 403
                throw error
            }

            res.status(201).json({ success: true, data: data.data })
        } else if(filtro === 'Nuevos productos') {
            const data = await new GestionProductos().productoXReciente()
            if(!data.success) {
                const error = new Error(data.message)
                error.statusCode = 403
                throw error
            }

            res.status(201).json({ success: true, data: data.data })
        } else {
            const error = new Error('Filtro no disponible')
            error.statusCode = 403
            throw error
        }
    } catch (e) { next(e) }
}

const obtenerRegiones = async (req, res, next) => {
    try {
        const data = await new GestionProductos().obtenerRegiones()
        if(!data.success) {
            const error = new Error('Error al obtener las regiones')
            error.statusCode = 402
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch (e) { next(e) }
}

const agregarRegionesProductos = async (req, res, next) => {
    const { id_producto, regiones } = req.body;
    try {
        if(!id_producto || !regiones) {
            const error = new Error('Datos vacios')
            error.statusCode = 401
            throw error
        }

        const data = await new GestionProductos().agregarRegionesProductos(id_producto, regiones)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 402
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const restarProductoPorCompra = async (req, res, next) => {
    const { carrito } = req.body
    try {
        if(!carrito || carrito.length < 1) {
            const error = new Error('No hay productos')
            error.statusCode = 405
            throw error
        }

        const data = await new GestionProductos().restarProductoPorCompra(carrito)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 401
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

module.exports = {
    agregarProducto,
    obtenerProductos,
    obtenerProductosAdmin,
    eliminarProducto,
    actualizarProducto,
    obtenerProductosPorFiltro,
    obtenerRegiones,
    agregarRegionesProductos,
    restarProductoPorCompra,
}