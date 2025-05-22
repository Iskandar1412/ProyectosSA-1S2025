const { pool } = require("../../config/db")

class GestionProductos {
    async crearProducto(id_categoria, id_marca, id_usuario, nombre, descripcion, precio, cantidad, disponibilidad, valor) {
        try {
            const [verificarCategoria] = await pool.promise().query(`SELECT COUNT(*) AS count FROM categorias c WHERE c.id_categoria = ?`, [id_categoria])
            
            if(verificarCategoria[0].count === 0) {
                return { success: false, message: 'Categoria no existente' }
            }
            
            const [verificarMarca] = await pool.promise().query(`SELECT COUNT(*) AS count FROM marcas m WHERE m.id_marca = ?`, [id_marca])
            
            if(verificarMarca[0].count === 0) {
                return { success: false, message: 'Marca no existente' }
            }
            
            const [verificarProducto] = await pool.promise().query(`SELECT COUNT(*) AS count FROM productos p WHERE p.nombre = ?`, [nombre])
            
            if(verificarProducto[0].count !== 0) {
                return { success: false, message: 'Producto existente' }
            }
            
            const [obtenerIDUltimo] = await pool.promise().query(`SELECT MAX(id_producto) as Max FROM productos`)
            if(!obtenerIDUltimo[0].Max) { obtenerIDUltimo[0].Max = 0 }
            
            function generarCodigo(valor) {
                const formateo = String(valor + 1).padStart(6, '0');
                return `P-${formateo}`
            }

            const codigo = generarCodigo(obtenerIDUltimo[0].Max)
            // console.log(id_categoria, id_marca, generarCodigo(obtenerIDUltimo[0].Max), creado_por, nombre, descripcion, precio, cantidad, disponibilidad, valor)
            await pool.promise().query(
                `INSERT INTO productos(id_categoria, id_marca, codigo, creado_por, nombre, descripcion, precio, cantidad, disponibilidad, valor)
                VALUES(?,?,?,?,?,?,?,?,?,?)`,
                [id_categoria, id_marca, codigo, id_usuario, nombre, descripcion, precio, cantidad, disponibilidad, valor]
            )

            return { success: true }
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerProductos() {
        try {
            
            const [resultado] = await pool.promise().query(
                `
                    SELECT JSON_OBJECT(
                        'id_producto', p.id_producto,
                        'nombre', p.nombre,
                        'descripcion', p.descripcion,
                        'precio', p.precio,
                        'codigo', p.codigo,
                        'valor', p.valor,
                        'cantidad', p.cantidad,
                        'disponibilidad', p.disponibilidad,
                        'fecha_creacion', p.fecha_creacion,
                        'id_categoria', c.id_categoria,
                        'nombre_categoria', c.nombre,
                        'id_marca', m.id_marca,
                        'nombre_marca', m.nombre,
                        'imagenes', COALESCE(
                            (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id_imagen', pi.id_imagen,
                                        'url_imagen', pi.url_imagen
                                    )
                                )
                                FROM productos_imagenes pi
                                WHERE pi.id_producto = p.id_producto
                                ORDER BY pi.id_imagen
                            ),
                            JSON_ARRAY()
                        ),
                        'regiones', COALESCE(
                            (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id_region', pr.id_region,
                                        'id_producto', pr.id_producto,
                                        'region_nombre', reg.nombre
                                    )
                                )
                                FROM productos_region pr
                                JOIN regiones reg ON reg.id_region = pr.id_region
                                WHERE pr.id_producto = p.id_producto
                                ORDER BY pr.id_producto_region ASC
                            ),
                            JSON_ARRAY()
                        ),
                        'promociones', COALESCE(
                            (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id_promocion', pro.id_promocion,
                                        'porcentaje_promocion', pro.porcentaje,
                                        'id_promocion_producto', pp.id_promocion_producto,
                                        'fecha_inicio', pp.fecha_inicio,
                                        'fecha_fin', pp.fecha_fin
                                    )
                                )
                                FROM promocion_productos pp
                                JOIN promociones pro ON pro.id_promocion = pp.id_promocion
                                WHERE pp.id_producto = p.id_producto AND (? BETWEEN pp.fecha_inicio AND pp.fecha_fin)
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Productos
                    FROM productos p
                    JOIN categorias c ON p.id_categoria = c.id_categoria
                    JOIN marcas m ON p.id_marca = m.id_marca
                    WHERE p.disponibilidad = true
                    ORDER BY p.nombre ASC
                `,
                [new Date()]
            )

            if(resultado.length === 0) { return { success: true, message: [] } }
            const productos = resultado.map(row => row.Productos);

            return { success: true, message: productos }
        } catch (e) { return { success: false, message: e } }
    }

    async obtenerProductosAdmin() {
        try {
            const [resultado] = await pool.promise().query(
                `
                    SELECT JSON_OBJECT(
                        'id_producto', p.id_producto,
                        'nombre', p.nombre,
                        'descripcion', p.descripcion,
                        'precio', p.precio,
                        'codigo', p.codigo,
                        'valor', p.valor,
                        'cantidad', p.cantidad,
                        'disponibilidad', p.disponibilidad,
                        'fecha_creacion', p.fecha_creacion,
                        'id_categoria', c.id_categoria,
                        'nombre_categoria', c.nombre,
                        'id_marca', m.id_marca,
                        'nombre_marca', m.nombre,
                        'imagenes', COALESCE(
                            (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id_imagen', pi.id_imagen,
                                        'url_imagen', pi.url_imagen
                                    )
                                )
                                FROM productos_imagenes pi
                                WHERE pi.id_producto = p.id_producto
                                ORDER BY pi.id_imagen
                            ),
                            JSON_ARRAY()
                        ),
                        'regiones', COALESCE(
                            (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id_region', pr.id_region,
                                        'id_producto', pr.id_producto
                                    )
                                )
                                FROM productos_region pr
                                JOIN regiones reg ON reg.id_region = pr.id_region
                                WHERE pr.id_producto = p.id_producto
                                ORDER BY pr.id_producto_region ASC
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Productos
                    FROM productos p
                    JOIN categorias c ON p.id_categoria = c.id_categoria
                    JOIN marcas m ON p.id_marca = m.id_marca
                    ORDER BY p.codigo ASC
                `
            )

            if(resultado.length === 0) { return { success: true, message: [] } }
            const productos = resultado.map(row => row.Productos);

            return { success: true, message: productos }
        } catch (e) { return { success: false, message: e } }
    }

    async eliminarProducto(id) {
        try {
            const [busqueda] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM productos WHERE id_producto = ?`,
                [id]    
            )

            if(busqueda[0].count === 0) return { success: false, message: "id de producto no encontrado" }
             
            await pool.promise().query(
                `DELETE FROM productos WHERE id_producto = ?`,
                [id]
            )

            return { success: true, message: 'Producto eliminada exitosamente' }
        } catch (e) { return { success: false, message: e } }
    }

    async actualizarProducto(id_producto, id_categoria, id_marca, nombre, descripcion, precio, cantidad, disponibilidad, valor) {
        try {
            const [buscarProducto] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM productos WHERE id_producto = ?`,
                [id_producto]
            )

            if(buscarProducto[0].count === 0) return { success: false, message: "Producto a modificar no encontrado" }
            
            const [categoriaBuscar] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM categorias WHERE id_categoria = ?`,
                [id_categoria]
            )

            if(categoriaBuscar[0].count === 0) return { success: false, message: "Categoria no encotrada" }

            const [marcaBuscar] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM marcas WHERE id_marca = ?`,
                [id_marca]
            )

            if(marcaBuscar[0].count === 0) return { success: false, message: "Marca no encotrada" }

            const [modificar] = await pool.promise().query(
                `
                    UPDATE productos
                    SET id_categoria = ?, id_marca = ?, nombre = ?, descripcion = ?, precio = ?, cantidad = ?, disponibilidad = ?, valor = ?
                    WHERE id_producto = ? AND (id_categoria != ? OR  id_marca != ? OR nombre != ? OR descripcion != ? OR precio != ? OR cantidad != ? OR disponibilidad != ? OR valor != ?)
                `,
                [id_categoria, id_marca, nombre, descripcion, precio, cantidad, disponibilidad, valor, id_producto, id_categoria, id_marca, nombre, descripcion, precio, cantidad, disponibilidad, valor]
            )

            if(modificar.affectedRows === 0) return { success: false, message: 'No se puede cambiar el valores iguales del producto por el mismo' }

            return { success: true, message: "Producto actualizado con éxito" }
        } catch (e) { return { success: false, message: e } }
    }

    async productoXCategoria (parametros) {
        try {
            const [resultado] = await pool.promise().query(
                `
                    SELECT JSON_OBJECT(
                        'id_producto', p.id_producto,
                        'nombre', p.nombre,
                        'descripcion', p.descripcion,
                        'precio', p.precio,
                        'codigo', p.codigo,
                        'valor', p.valor,
                        'cantidad', p.cantidad,
                        'disponibilidad', p.disponibilidad,
                        'fecha_creacion', p.fecha_creacion,
                        'id_marca', m.id_marca,
                        'nombre_marca', m.nombre,
                        'imagenes', COALESCE(
                            (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id_imagen', pi.id_imagen,
                                        'url_imagen', pi.url_imagen
                                    )
                                )
                                FROM productos_imagenes pi
                                WHERE pi.id_producto = p.id_producto
                                ORDER BY pi.id_imagen
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Productos
                    FROM productos p
                    JOIN marcas m ON p.id_marca = m.id_marca
                    WHERE p.id_categoria = ? AND p.disponibilidad = true
                `,
                [parametros]
            )

            if(resultado.length === 0) { return { success: false, message: 'No hay productos en la categoria especificada' } }
            const productos = resultado.map(row => row.Productos);

            return { success: true, data: productos }
        } catch(e) { return { success: false, message: e } }
    }

    async productoXMarca (parametros) {
        try {
            const [resultado] = await pool.promise().query(
                `
                    SELECT JSON_OBJECT(
                        'id_producto', p.id_producto,
                        'nombre', p.nombre,
                        'descripcion', p.descripcion,
                        'precio', p.precio,
                        'codigo', p.codigo,
                        'valor', p.valor,
                        'cantidad', p.cantidad,
                        'disponibilidad', p.disponibilidad,
                        'fecha_creacion', p.fecha_creacion,
                        'id_categoria', c.id_categoria,
                        'nombre_categoria', c.nombre,
                        'imagenes', COALESCE(
                            (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id_imagen', pi.id_imagen,
                                        'url_imagen', pi.url_imagen
                                    )
                                )
                                FROM productos_imagenes pi
                                WHERE pi.id_producto = p.id_producto
                                ORDER BY pi.id_imagen
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Productos
                    FROM productos p
                    JOIN categorias c ON p.id_categoria = c.id_categoria
                    WHERE p.id_marca = ? AND p.disponibilidad = true
                `,
                [parametros]
            )

            if(resultado.length === 0) { return { success: false, message: 'No hay productos en la marca especificada' } }
            const productos = resultado.map(row => row.Productos);

            return { success: true, data: productos }
        } catch(e) { return { success: false, message: e } }
    }

    async productoXRangoPrecio (parametros) {
        // console.log(parametros)
        try {
            const [resultado] = await pool.promise().query(
                `
                    SELECT JSON_OBJECT(
                        'id_producto', p.id_producto,
                        'nombre', p.nombre,
                        'descripcion', p.descripcion,
                        'precio', p.precio,
                        'codigo', p.codigo,
                        'valor', p.valor,
                        'cantidad', p.cantidad,
                        'disponibilidad', p.disponibilidad,
                        'fecha_creacion', p.fecha_creacion,
                        'id_categoria', c.id_categoria,
                        'nombre_categoria', c.nombre,
                        'id_marca', m.id_marca,
                        'nombre_marca', m.nombre,
                        'imagenes', COALESCE(
                            (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id_imagen', pi.id_imagen,
                                        'url_imagen', pi.url_imagen
                                    )
                                )
                                FROM productos_imagenes pi
                                WHERE pi.id_producto = p.id_producto
                                ORDER BY pi.id_imagen
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Productos
                    FROM productos p
                    JOIN categorias c ON p.id_categoria = c.id_categoria
                    JOIN marcas m ON p.id_marca = m.id_marca
                    WHERE (p.precio BETWEEN ? AND ?) AND p.disponibilidad = true
                    ORDER BY p.id_producto ASC
                `,
                [parametros.split('-')[0], parametros.split('-')[1]]
            )

            if(resultado.length === 0) { return { success: false, message: 'No hay productos en el rango de precio especificado' } }
            const productos = resultado.map(row => row.Productos);

            return { success: true, data: productos }
        } catch(e) { return { success: false, message: e } }
    }

    async productoXReciente () {
        // console.log(parametros)
        try {
            const [resultado] = await pool.promise().query(
                `
                    SELECT JSON_OBJECT(
                        'id_producto', p.id_producto,
                        'nombre', p.nombre,
                        'descripcion', p.descripcion,
                        'precio', p.precio,
                        'codigo', p.codigo,
                        'valor', p.valor,
                        'cantidad', p.cantidad,
                        'disponibilidad', p.disponibilidad,
                        'fecha_creacion', p.fecha_creacion,
                        'id_categoria', c.id_categoria,
                        'nombre_categoria', c.nombre,
                        'id_marca', m.id_marca,
                        'nombre_marca', m.nombre,
                        'imagenes', COALESCE(
                            (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id_imagen', pi.id_imagen,
                                        'url_imagen', pi.url_imagen
                                    )
                                )
                                FROM productos_imagenes pi
                                WHERE pi.id_producto = p.id_producto
                                ORDER BY pi.id_imagen
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Productos
                    FROM productos p
                    JOIN categorias c ON p.id_categoria = c.id_categoria
                    JOIN marcas m ON p.id_marca = m.id_marca
                    WHERE p.disponibilidad = true
                    ORDER BY p.fecha_creacion DESC
                    LIMIT 5
                `
            )

            if(resultado.length === 0) { return { success: false, message: 'No hay productos recientes' } }
            const productos = resultado.map(row => row.Productos);

            return { success: true, data: productos }
        } catch(e) { return { success: false, message: e } }
    }

    async agregarRegiones (pais) {
        try {
            // console.log(pais)
            const [buscar] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM regiones WHERE nombre = ?`,
                [pais]
            )

            if(buscar[0].count !== 0) { return { success: false, message: 'Ciudad existente' } }
            
            const [result] = await pool.promise().query(`INSERT INTO regiones(nombre) VALUES(?)`, [pais])
            if(result.affectedRows === 0) { return { success: false, message: 'Error al agregar la ciudad' } }

            return { success: true, data: "Regiones Agregadas" }
        } catch(e) { return { success: false, message: e } }
    }

    async agregarDepartamentos(pais, departamento) {
        try {
            const [buscar] = await pool.promise().query(`SELECT id_region FROM regiones WHERE nombre = ?`, [pais])
            if(!buscar[0].id_region) { return { success: false, message: 'Error al agregar departamento' } }

            const [buscarAgregadoRegion] = await pool.promise().query('SELECT COUNT(*) AS count FROM departamentos WHERE id_region = ? AND nombre = ?', [buscar[0].id_region, departamento])
            // console.log(buscarAgregadoRegion)
            if(buscarAgregadoRegion[0].count !== 0) { return { success: false, message: 'Departamento existente' } }

            const [result] = await pool.promise().query(`INSERT INTO departamentos(nombre, id_region) VALUES(?,?)`, [departamento, buscar[0].id_region])
            if(!result.affectedRows === 0) { return { success: false, message: 'Error en la inserción de departamentos' } }

            return { success: true, message: 'Agregado exitosamente' }
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerRegiones() {
        try {
            const [result] = await pool.promise().query(`SELECT id_region, nombre FROM regiones ORDER BY id_region ASC`)

            return { success: true, message: result }
        } catch(e) { return { success: false, message: e } }
    }

    async agregarRegionesProductos(id_producto, regiones) {
        try {
            const conn = await pool.promise().getConnection();
            await conn.beginTransaction();
    
            try {
                await conn.query(
                    `DELETE FROM productos_region WHERE id_producto = ?`,
                    [id_producto]
                );
                
                for (const element of regiones) {
                    await conn.query(
                        `INSERT INTO productos_region(id_producto, id_region) VALUES(?,?)`,
                        [id_producto, element.id_region]
                    );
                }
    
                await conn.commit();
                return { success: true };
            } catch (e) {
                await conn.rollback();
                throw e;
            } finally {
                conn.release();
            }
        } catch(e) { return { success: false, message: e.message } }
    }

    async restarProductoPorCompra(productos) {
        try {
            const conn = await pool.promise().getConnection()
            await conn.beginTransaction()

            try {
                for (const producto of productos) {
                    await conn.query(
                        `UPDATE productos SET cantidad = ? WHERE id_producto = ?`,
                        [producto.cantidadMaxima - producto.cantidad, producto.id_producto]
                    )
                }

                await conn.commit();
                return { success: true, message: 'Cambios realizados' }
            } catch(e) {
                await conn.rollback();
                throw e;
            } finally { conn.release() }
        } catch(e) { return { success: false, message: e } }
    }
}

module.exports = {
    GestionProductos,
}