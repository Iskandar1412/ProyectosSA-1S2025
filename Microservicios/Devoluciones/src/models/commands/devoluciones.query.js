const { pool } = require("../../config/db");
const SendMail = require("../../config/mail");

class GestionDevoluciones {
    async agregarDevolucion (id_usuario, correo_usuario, id_producto, codigo_producto, cantidad, motivo_devolucion, precio_producto) {
        try {
            let precio_total = cantidad * precio_producto;
            const [buscar] = await pool.promise().query(
                `
                    SELECT COUNT(*) AS count FROM devoluciones
                    WHERE id_usuario = ? AND id_producto = ?
                `,
                [id_usuario, id_producto]
            )

            if(buscar[0].count > 0) return { success: false, message: 'No se puede tener más de una devolución del mismo producto' }

            await pool.promise().query(
                `
                    INSERT INTO devoluciones(id_usuario, correo_usuario, fecha_devolucion, id_producto, codigo_producto, cantidad, motivo_devolucion, precio_producto, precio_total)
                    VALUES(?,?,?,?,?,?,?,?,?)
                `,
                [id_usuario, correo_usuario, new Date(), id_producto, codigo_producto, cantidad, motivo_devolucion, precio_producto, precio_total]
            )

            return { success: true, message: 'Exito al realizar peticion' }
        } catch(e) { return { success: false, message: e } }
    }

    async generarCuponValorProductoUsuario(id_devolucion, valor, correo) {
        try {
            const [existe] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM cupon_devolucion WHERE id_devolucion = ?`,
                [id_devolucion]
            )

            if(existe[0].count > 0) return { success: false, message: 'No se puede hacer otro cupon del mismo producto' }

            await pool.promise().query(
                `INSERT INTO cupon_devolucion(id_devolucion, valor_precio) VALUES(?,?)`,
                [id_devolucion, valor]
            )
            
            const htmlSend = `<p><strong>Cupon de Descuento</strong>: Fue aceptada su solicitud de devolución por Q. ${valor}</br></p>`;
            const usuario = await SendMail(correo, `Solicitud de Devolución aceptada`, htmlSend);
            if (!usuario.success) {
                return { success: false, message: 'Error al enviar el correo' };
            }

            return { success: true, message: 'Cupon generado' }
        } catch(e) { return { success: false, message: e } }
    }

    async modificarDevolucion(id_devolucion, estado) {
        const connection = await pool.promise().getConnection();
        try {
            await connection.beginTransaction();
    
            const [devolucion] = await connection.query(
                `SELECT estado, correo_usuario, precio_total FROM devoluciones WHERE id_devolucion = ?`,
                [id_devolucion]
            );
    
            if (devolucion.length === 0) {
                await connection.rollback();
                return { success: false, message: 'Devolución no existente' };
            }
    
            const estadoActual = devolucion[0].estado;
            const transicionesPermitidas = {
                'PENDIENTE': ['EN PROCESO', 'ACEPTADO', 'RECHAZADO'],
                'EN PROCESO': ['ACEPTADO', 'RECHAZADO'],
                'ACEPTADO': [],
                'RECHAZADO': []
            };
            
            if (!transicionesPermitidas.hasOwnProperty(estadoActual)) {
                await connection.rollback();
                return { success: false, message: `Estado actual '${estadoActual}' no es válido` };
            }
            
            if (!transicionesPermitidas[estadoActual].includes(estado)) {
                await connection.rollback();
                return { 
                    success: false, 
                    message: `Transición no permitida: de '${estadoActual}' a '${estado}'` 
                };
            }
            
            const [response] = await connection.query(
                `UPDATE devoluciones SET estado = ? WHERE id_devolucion = ?`,
                [estado, id_devolucion]
            );
    
            if (response.affectedRows === 0) {
                await connection.rollback();
                return { success: false, message: 'Error al actualizar el estado' };
            }
    
            await connection.commit();
            return { success: true, message: devolucion[0] };
        } catch (e) {
            await connection.rollback();
            console.error('Error en modificarDevolucion:', e);
            return { success: false, message: 'Error interno al procesar la devolución' };
        } finally {
            connection.release();
        }
    }

    async devolucionesUsuario (id_usuario) {
        try {
            const [buscar] = await pool.promise().query(
                `
                    SELECT id_devolucion, fecha_devolucion, estado, codigo_producto, cantidad, motivo_devolucion, precio_producto, precio_total
                    FROM devoluciones
                    WHERE id_usuario = ?
                `,
                [id_usuario]
            )

            if(buscar.length === 0) return { success: true, message: [] }

            const formatearFecha = (fecha) => {
                return fecha.toISOString().split('T')[0];
            };

            const devolucionesToSend = buscar.map(usuario => {
                return {
                    ...usuario,
                    fecha_devolucion: formatearFecha(new Date(usuario.fecha_devolucion))
                };
            });

            return { success: true, message: devolucionesToSend }
        } catch(e) { return { success: false, message: e } }
    }

    async devolucionesAdmin () {
        try {
            const [buscar] = await pool.promise().query(
                `
                    SELECT id_devolucion, fecha_devolucion, estado, codigo_producto, cantidad, motivo_devolucion, precio_producto, precio_total
                    FROM devoluciones
                `
            )

            if(buscar.length === 0) return { success: true, message: [] }

            const formatearFecha = (fecha) => {
                return fecha.toISOString().split('T')[0];
            };

            const devolucionesToSend = buscar.map(usuario => {
                return {
                    ...usuario,
                    fecha_devolucion: formatearFecha(new Date(usuario.fecha_devolucion))
                };
            });

            return { success: true, message: devolucionesToSend }
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerCuponDevolucionUsuario(id_usuario) {
        try {
            const [response] = await pool.promise().query(
                `
                    SELECT cd.id, cd.valor_precio, cd.id_devolucion
                    FROM cupon_devolucion cd
                    LEFT JOIN devoluciones d ON cd.id_devolucion = d.id_devolucion
                    WHERE d.id_usuario = ? AND cd.usado = false
                    
                `,
                [id_usuario]
            )

            if(response.length === 0) return { success: true, message: [] }

            return { success: true, message: response }
    } catch(e) { return { success: false, message: e } }
}

    async crearOtroCuponDiferencia(id_devolucion, valor, correo) {
        try {
            const [response] = await pool.promise().query(
                `INSERT INTO cupon_devolucion(id_devolucion, valor_precio) VALUES(?,?)`,
                [id_devolucion, valor]
            )

            if(response.affectedRows === 0) return { success: false, message: 'Error al crear el cupon' }

            const htmlSend = `<p><strong>Cupon de Descuento</strong>: Por haber gastado menos de lo que el cupón le daba tiene otro cupon con la diferencia Q. ${valor}</br></p>`;
            const usuario = await SendMail(correo, `Cupon de Descuento Ajustado`, htmlSend);
            if (!usuario.success) {
                return { success: false, message: 'Error al enviar el correo' };
            }

            return { success: true, message: response }
        } catch(e) { return { success: false, message: e } }
    }

    async modificarEstadoCuponUsuario(id) {
        try {
            const [response] = await pool.promise().query(
                `UPDATE cupon_devolucion SET usado = true WHERE id = ? AND usado = false`,
                [id]
            )

            if(response.affectedRows === 0) return { success: false, message: 'Error al modificar el cupon' }

            return { success: true, message: 'Cupon modificado exitosamente' }
        } catch(e) { return { success: false, message: e } }
    }
}

module.exports = { 
    GestionDevoluciones
}