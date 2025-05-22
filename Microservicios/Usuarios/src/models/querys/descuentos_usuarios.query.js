const { pool } = require("../../config/db")
const SendMail = require("../../config/mail")

class GestionDescuentosUsuarios {
    async agregarDescuentoUsuario(id_usuario, id_descuento, fecha_asignacion, fecha_caducidad) {
        try {
            const [buscarUsuario] = await pool.promise().query(
                `
                    SELECT u.correo, u.username
                    FROM usuario u
                    WHERE u.id_usuario = ?;
                `,
                [id_usuario]
            )

            if(buscarUsuario.length === 0) return { success: false, message: 'Usuario no encontrado' }
            
            const [response] = await pool.promise().query(
                `
                    INSERT INTO usuarios_descuentos(id_usuario, id_descuento, fecha_asignacion, fecha_caducidad)
                    VALUES(?,?,?,?)
                `,
                [id_usuario, id_descuento, fecha_asignacion, fecha_caducidad]
            )

            if(response.affectedRows === 0) return { success: false, message: 'No se agrego el descuento' }
            
            // console.log(buscarUsuario[0])
            const htmlSend = `<p><strong>${buscarUsuario[0].username}</strong>: Se le ha generado un cupon de descuento para la compra de cualquier producto</br></br>Empezará el: <strong>${fecha_asignacion}</strong></br>Tiene hasta el: <strong>${fecha_caducidad}</strong> para usarlo</br>:D</p>`;
            const usuario = await SendMail(buscarUsuario[0].correo, `Nuevo cupon de Descuento`, htmlSend);
            if (!usuario.success) {
                return { success: false, message: 'Error al enviar el correo' };
            }
                
            return { success: true, message: `Descuento agregado al usuario exitosamente` }
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerDescuentosUsuarios() {
        try {
            const [response] = await pool.promise().query(
                `
                    SELECT ud.id_descuento_usuario, ud.id_usuario, ud.id_descuento, d.porcentaje_descuento, d.rango_compra_min, d.rango_compra_max, ud.fecha_asignacion, ud.fecha_caducidad, ud.activo, u.nombre AS nombre_usuario
                    FROM usuarios_descuentos ud
                    JOIN usuario u ON u.id_usuario = ud.id_usuario
                    JOIN descuentos d ON ud.id_descuento = d.id_descuento
                    ORDER BY ud.id_descuento_usuario ASC
                `
            )
            if(response.length < 1) { return { success: true, message: [] } }

            const formatearFecha = (fecha) => {
                return fecha.toISOString().split('T')[0];
            };

            const usuariosFormateados = response.map(usuario => {
                return {
                    ...usuario,
                    fecha_asignacion: formatearFecha(new Date(usuario.fecha_asignacion)),
                    fecha_caducidad: formatearFecha(new Date(usuario.fecha_caducidad))
                };
            });

            return { success: true, message: usuariosFormateados }
        } catch(e) { return { success: false, message: e } }
    }

    async generarDescuentoUsuario(id_usuario, monto_pagado, fecha_asignacion, fecha_caducidad) {
        try {
            const [verificarUsuario] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM usuario WHERE id_usuario = ?`,
                [id_usuario]
            )

            if(!verificarUsuario[0].count === 0) return { success: false, message: 'Usuario no encontrado' }
            
            const [buscarUsuario] = await pool.promise().query(
                `
                    SELECT u.correo, u.username
                    FROM usuario u
                    WHERE u.id_usuario = ?;
                `,
                [id_usuario]
            )

            if(buscarUsuario.length === 0) return { success: false, message: 'Usuario no encontrado' }

            const [obtenerPromocion] = await pool.promise().query(
                `
                    SELECT d.id_descuento
                    FROM (SELECT 1 AS dummy) AS x
                    LEFT JOIN descuentos d
                    ON ? BETWEEN d.rango_compra_min AND d.rango_compra_max;
                `,
                [monto_pagado]
            )
            // console.log(obtenerPromocion)
            if(obtenerPromocion[0].id_descuento === null) return { success: true, message: 'El monto no entra en el rango para descuentos' }

            const [response] = await pool.promise().query(
                `
                    INSERT INTO usuarios_descuentos(id_usuario, id_descuento, fecha_asignacion, fecha_caducidad)
                    VALUES(?,?,?,?)
                `,
                [id_usuario, obtenerPromocion[0].id_descuento, fecha_asignacion, fecha_caducidad]
            )

            if(response.affectedRows === 0) return { success: false, message: 'No se pudo generar el descuento' }

            const htmlSend = `<p><strong>${buscarUsuario[0].username}</strong>: Se le ha generado un cupon de descuento para la compra de cualquier producto</br></br>Tiene hasta el: <strong>${fecha_caducidad}</strong> para usarlo</br>:D</p>`;
            const usuario = await SendMail(buscarUsuario[0].correo, `Nuevo cupon de Descuento`, htmlSend);
            if (!usuario.success) {
                return { success: false, message: 'Error al enviar el correo' };
            }

            return { success: true, message: `Desguento generado exitosamente` }
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerDescuentosUsuarioSeleccionado(id) {
        try {
            const [result] = await pool.promise().query(
                `
                    SELECT d.id_descuento, d.porcentaje_descuento, ud.id_descuento_usuario
                    FROM usuarios_descuentos ud
                    LEFT JOIN descuentos d ON ud.id_descuento = d.id_descuento
                    WHERE ud.id_usuario = ? AND (? BETWEEN ud.fecha_asignacion AND ud.fecha_caducidad) AND ud.activo = TRUE
                    ORDER BY d.porcentaje_descuento ASC
                `,
                [id, new Date()]
            )

            if(result.length < 1) return { success: true, message: [] }

            return { success: true, message: result }
        } catch(e) { return { success: false, message: e } }
    }

    async modificarDescuentosUsuarios(id_descuento_usuario, id_descuento, fecha_caducidad, activo) {
        try {
            const [verificar] = await pool.promise().query(
                `
                    SELECT COUNT(*) AS count
                    FROM usuarios_descuentos
                    WHERE id_descuento_usuario = ?`,
                [id_descuento_usuario]
            )

            if(verificar[0].count === 0) return { success: false, message: 'Cupon no encontrado' }

            const [response] = await pool.promise().query(
                `
                    UPDATE usuarios_descuentos
                    SET id_descuento = ?, fecha_caducidad = ?, activo = ?
                    WHERE id_descuento_usuario = ? AND (id_descuento != ? OR fecha_caducidad != ? OR activo != ?)
                `,
                [id_descuento, fecha_caducidad, activo, id_descuento_usuario, id_descuento, fecha_caducidad, activo]
            )

            if(response.affectedRows === 0) return { success: false, message: 'Error al actualizar el descuento' }
            return { success: true, message: 'Descuento modificado exitosamente' }
        } catch(e) { return { success: false, message: e } }
    }

    async cuponUsado(id_descuento_usuario) {
        try {
            const [verificar] = await pool.promise().query(
                `
                    SELECT COUNT(*) AS count
                    FROM usuarios_descuentos
                    WHERE id_descuento_usuario = ? AND activo = true`,
                [id_descuento_usuario]
            )

            if(verificar[0].count === 0) return { success: false, message: 'Cupon no encontrado o desactivado' }
            
            await pool.promise().query(
                `
                    UPDATE usuarios_descuentos 
                    SET activo = false
                    WHERE id_descuento_usuario = ?
                `,
                [id_descuento_usuario]
            )

            return { success: true, message: 'Cupon usado' }
        } catch(e) { return { success: false, message: e } }
    }

    async eliminarDescuentoUsuario(id_descuento_usuario) {
        try {
            const [buscar] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM usuarios_descuentos WHERE id_descuento_usuario = ?`,
                [id_descuento_usuario]
            )

            if(buscar[0].count === 0) return { success: false, message: 'Descuento no encontrado' }
            await pool.promise().query(`DELETE FROM usuarios_descuentos WHERE id_descuento_usuario = ?`, [id_descuento_usuario])
            return { success: true, message: 'Borrado descuento de usuario' }
        } catch(e) { return { success: false, message: e } }
    }
}

module.exports = {
    GestionDescuentosUsuarios
}