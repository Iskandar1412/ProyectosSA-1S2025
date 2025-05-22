const { pool } = require("../../config/db")
const SendMail = require("../../config/mail")

class GestionFavoritos {
    async agregarQuitar(id_usuario, id_producto, correo) {
        try {
            const [response] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM favoritos WHERE id_usuario = ? AND id_producto = ?`,
                [id_usuario, id_producto]
            )
            
            if(response[0].count === 0) {
                const [modificar] = await pool.promise().query(
                    `INSERT INTO favoritos(id_usuario, id_producto, correo_usuario) VALUES(?,?,?)`,
                    [id_usuario, id_producto, correo]
                )

                if (modificar.affectedRows === 0) return { success: false, message: 'Error al agregar favorito' }
                return { success: true, message: 'Exito al agrega favorito' }
            } else {
                const [modificar] = await pool.promise().query(
                    `DELETE FROM favoritos WHERE id_usuario = ? AND id_producto = ?`,
                    [id_usuario, id_producto]
                )

                if(modificar.affectedRows === 0) return { success: false, message: 'Error al quitar favorito' }
                return { success: true, message: 'Exito al quitar favorito' }
            }
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerFavoritos(id_usuario) {
        try {
            const [response] = await pool.promise().query(
                `SELECT id_producto FROM favoritos WHERE id_usuario = ?`,
                [id_usuario]
            )

            if (response.length === 0) { return { success: true, message: [] } }
            return { success: true, message: response }
        } catch(e) { return { success: false, message: e } }
    }

    async parseoVerProductosFavoritosBajos(productos) {
        try {
            let totalNotificaciones = 0;
            let totalErrores = 0;
    
            for (const producto of productos) {
                const stockBajo = (producto.cantidadMaxima - producto.cantidad) <= 5;
                
                if (!stockBajo) continue;
    
                const [usuariosFavoritos] = await pool.promise().query(
                    `SELECT correo_usuario FROM favoritos WHERE id_producto = ?`,
                    [producto.id_producto]
                );
    
                if (usuariosFavoritos.length === 0) continue;
    
                const htmlSend = `
                    <p><strong>Producto con pocas unidades en Stock</strong>: 
                    El producto ${producto.nombre} (${producto.codigo}) está quedando con pocas unidades 
                    (${producto.cantidadMaxima - producto.cantidad} restantes).</p>
                    <p>¡No te quedes sin él!</p>
                `;
    
                const resultados = await Promise.all(
                    usuariosFavoritos.map(usuario => 
                        SendMail(
                            usuario.correo_usuario, 
                            `¡Tu producto favorito está por agotarse!`, 
                            htmlSend
                        )
                    )
                );
    
                const errores = resultados.filter(r => !r.success).length;
                totalNotificaciones += resultados.length - errores;
                totalErrores += errores;
            }
    
            return { 
                success: totalErrores === 0,
                message: `Proceso completado. ${totalNotificaciones} notificaciones enviadas, ${totalErrores} fallos`,
                data: {
                    notificacionesEnviadas: totalNotificaciones,
                    notificacionesFallidas: totalErrores
                }
            };
        } catch(e) { 
            console.error('Error:', e);
            return { 
                success: false, 
                message: e.message || 'Error desconocido' 
            };
        }
    }

    async notificarCambioProducto(producto) {
        try {
            let totalNotificaciones = 0;
            let totalErrores = 0;
            
            console.log(producto)

            const [usuariosFavoritos] = await pool.promise().query(
                `SELECT correo_usuario FROM favoritos WHERE id_producto = ?`,
                [producto.id_producto]
            );

            if (usuariosFavoritos.length === 0) {
                return { 
                    success: totalErrores === 0,
                    message: `Proceso completado. ${totalNotificaciones} notificaciones enviadas, ${totalErrores} fallos`,
                    data: {
                        notificacionesEnviadas: totalNotificaciones,
                        notificacionesFallidas: totalErrores
                    }
                };
            }

            const htmlSend = `
                <p><strong>Producto Con actualizaciones</strong>: 
                El producto ${producto.nombre} fue modificado 
                (${producto.cantidad} en stock).
                $${producto.precio}</p>

                <p>¡No te quedes sin él!</p>
            `;
            
            const resultados = await Promise.all(
                usuariosFavoritos.map(usuario => 
                    SendMail(
                        usuario.correo_usuario, 
                        `¡Tu producto favorito tuvo cambios!`, 
                        htmlSend
                    )
                )
            );

            const errores = resultados.filter(r => !r.success).length;
            totalNotificaciones += resultados.length - errores;
            totalErrores += errores;
            
    
            return { 
                success: totalErrores === 0,
                message: `Proceso completado. ${totalNotificaciones} notificaciones enviadas, ${totalErrores} fallos`,
                data: {
                    notificacionesEnviadas: totalNotificaciones,
                    notificacionesFallidas: totalErrores
                }
            };
        } catch(e) { 
            console.error('Error:', e);
            return { 
                success: false, 
                message: e.message || 'Error desconocido' 
            };
        }
    }
}

module.exports = {
    GestionFavoritos
}