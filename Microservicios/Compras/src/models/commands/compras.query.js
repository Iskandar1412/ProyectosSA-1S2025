const { pool } = require("../../config/db")

class GestionCompras {
    async agregarCompra(id_usuario, correo_usuario, total_pagar, descuento, sub_total, carrito) {
        const connection = await pool.promise().getConnection();
        try {
            await connection.beginTransaction();

            const [ordenResult] = await connection.query(
                `
                    INSERT INTO ordenes (id_usuario, correo_usuario, fecha_orden, subtotal, cupon_descuento, total)
                    VALUES (?, ?, ?, ?, ?, ?)
                `,
                [id_usuario, correo_usuario, new Date(), sub_total, descuento, total_pagar]
            );

            const id_orden = ordenResult.insertId;
            const productosValues = carrito.map(item => [ item.id_producto, id_orden, item.cantidad, item.descuento || 0, item.codigo, item.nombre, item.precio ]);
            
            await connection.query(
                `
                    INSERT INTO productos_orden(id_producto, id_orden, cantidad, promocion, codigo_producto, nombre_producto, precio_unitario)
                    VALUES ?
                `,
                [productosValues]
            );
        
            await connection.commit();
            connection.release();
            return { success: true, message: id_orden };
        } catch (e) {
            await connection.rollback();
            connection.release();
            return { success: false, message: e.message };
        } finally {
            connection.release();
        }
    }

    async obtenerComprasAdmin() {
        try {
            const [response] = await pool.promise().query(
                `
                    SELECT JSON_OBJECT(
                        'id_orden', o.id_orden,
                        'correo_usuario', o.correo_usuario,
                        'fecha_orden', o.fecha_orden,
                        'estado', o.estado,
                        'subtotal', o.subtotal,
                        'cupon_descuento', o.cupon_descuento,
                        'total', o.total,
                        'productos', IFNULL(
                            JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'id_producto', po.id_producto,
                                    'cantidad', po.cantidad,
                                    'promocion', po.promocion,
                                    'codigo_producto', po.codigo_producto,
                                    'precio_unitario', po.precio_unitario,
                                    'nombre_producto', po.nombre_producto
                                )
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Compras
                    FROM ordenes o
                    LEFT JOIN productos_orden po ON o.id_orden = po.id_orden
                    GROUP BY o.id_orden
                `
            )

            // console.log(response)
            if(response.length === 0) { return { success: true, message: [] } }
            const compras = response.map(row => row.Compras)

            const formatearFecha = (fecha) => {
                return fecha.toISOString().split('T')[0];
            };

            const comprasToSend = compras.map(usuario => {
                return {
                    ...usuario,
                    fecha_orden: formatearFecha(new Date(usuario.fecha_orden))
                };
            });

            return { success: true, message: comprasToSend }
        } catch (e) { 
            console.log(e);
            return { success: false, message: e } }
    }

    async obtenerComprasUsuario(id_usuario) {
        try {
            const [response] = await pool.promise().query(
                `
                    SELECT JSON_OBJECT(
                        'id_orden', o.id_orden,
                        'correo_usuario', o.correo_usuario,
                        'fecha_orden', o.fecha_orden,
                        'estado', o.estado,
                        'subtotal', o.subtotal,
                        'cupon_descuento', o.cupon_descuento,
                        'total', o.total,
                        'productos', IFNULL(
                            JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'id_producto', po.id_producto,
                                    'cantidad', po.cantidad,
                                    'promocion', po.promocion,
                                    'codigo_producto', po.codigo_producto,
                                    'precio_unitario', po.precio_unitario,
                                    'nombre_producto', po.nombre_producto
                                )
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Compras
                    FROM ordenes o
                    LEFT JOIN productos_orden po ON o.id_orden = po.id_orden
                    WHERE o.id_usuario = ?
                    GROUP BY o.id_orden
                `,
                [id_usuario]
            )

            // console.log(response)
            if(response.length === 0) { return { success: true, message: [] } }
            const compras = response.map(row => row.Compras)

            const formatearFecha = (fecha) => {
                return fecha.toISOString().split('T')[0];
            };

            const comprasToSend = compras.map(usuario => {
                return {
                    ...usuario,
                    fecha_orden: formatearFecha(new Date(usuario.fecha_orden))
                };
            });

            return { success: true, message: comprasToSend }
        } catch (e) { return { success: false, message: e } }
    }

    async modificarEstadoCompra(id_compra, nuevo_estado) {
        const connection = await pool.promise().getConnection();
        try {
            await connection.beginTransaction();
    
            const [orden] = await connection.query(
                `SELECT estado FROM ordenes WHERE id_orden = ?`,
                [id_compra]
            );
    
            if (orden.length === 0) {
                await connection.rollback();
                return { success: false, message: 'No existe orden de compra' };
            }
    
            const estadoActual = orden[0].estado;
    
            const [indices] = await connection.query(
                `SELECT
                    FIND_IN_SET(?, 'PENDIENTE,PROCESANDO,ENVIADO,ADUANAS,ENTREGADO') AS indiceNuevo,
                    FIND_IN_SET(?, 'PENDIENTE,PROCESANDO,ENVIADO,ADUANAS,ENTREGADO') AS indiceActual`,
                [nuevo_estado, estadoActual]
            );
    
            const indiceNuevo = indices[0].indiceNuevo;
            const indiceActual = indices[0].indiceActual;
    
            if (indiceNuevo === 0 || indiceActual === 0) {
                await connection.rollback();
                return { success: false, message: 'Estado inválido' };
            }
    
            if (indiceNuevo <= indiceActual) {
                await connection.rollback();
                return { success: false, message: 'No se puede retroceder a un estado anterior' };
            }
    
            const [response] = await connection.query(
                `UPDATE ordenes SET estado = ? WHERE id_orden = ?`,
                [nuevo_estado, id_compra]
            );
    
            if (response.affectedRows === 0) {
                await connection.rollback();
                return { success: false, message: 'Error al modificar el estado' };
            }
    
            await connection.commit();
            return { success: true, message: 'Estado de orden modificado exitosamente' };
        } catch (e) {
            console.log(e);
            await connection.rollback();
            return { success: false, message: e.message };
        } finally {
            connection.release();
        }
    }  
    
    async obtenerHistorial(id_usuario) {
        try {
            const [response] = await pool.promise().query(
                `
                    SELECT po.id_producto_orden, po.id_producto, po.id_orden, po.cantidad, po.promocion, po.codigo_producto, po.precio_unitario, o.fecha_orden
                    FROM productos_orden po
                    LEFT JOIN ordenes o ON po.id_orden = o.id_orden
                    WHERE o.id_usuario = ?
                `,
                [id_usuario]
            )

            if(response.length === 0) return { success: true, message: [] }
            return { success: true, message: response } 
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerHistorialFinal(id_usuario) {
        try {
            const [response] = await pool.promise().query(
                `
                    SELECT po.id_producto_orden, po.id_producto, po.id_orden, po.cantidad, po.promocion, po.codigo_producto, po.precio_unitario, o.fecha_orden
                    FROM productos_orden po
                    LEFT JOIN ordenes o ON po.id_orden = o.id_orden
                    WHERE o.id_usuario = ? AND o.estado = 'ENTREGADO' AND o.cupon_descuento = 0
                `,
                [id_usuario]
            )

            if(response.length === 0) return { success: true, message: [] }
            
            const formatearFecha = (fecha) => {
                return fecha.toISOString().split('T')[0];
            };

            const historial = response.map(usuario => {
                return {
                    ...usuario,
                    fecha_orden: formatearFecha(new Date(usuario.fecha_orden))
                };
            });

            return { success: true, message: historial } 
        } catch(e) { return { success: false, message: e } }
    }
}

module.exports = {
    GestionCompras
}