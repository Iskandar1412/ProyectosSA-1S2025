const { pool } = require("../../config/db")

class GestionQuejas {
    async nuevaQuejaUsuario(id_usuario, tipo, descripcion) {
        try {
            const [usuario] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM usuario WHERE id_usuario = ? `,
                [id_usuario]
            )

            if(usuario[0].count === 0) return { success: false, message: 'Usuario no existente' }

            await pool.promise().query(
                `INSERT INTO quejas(id_usuario, tipo_queja, descripcion, fecha) VALUES(?,?,?,?)`,
                [id_usuario, tipo, descripcion, new Date()]
            )

            return { success: true, message: 'Queja realizada exitosamente' }
        } catch (e) { return { success: false, message: e } }
    }

    async obtenerQuejasUsuario(id_usuario) {
        try {
            const [usuario] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM usuario WHERE id_usuario = ? `,
                [id_usuario]
            )

            if(usuario[0].count === 0) return { success: false, message: 'Usuario no existente' }

            const [response] = await pool.promise().query(
                `SELECT id_queja, id_usuario, tipo_queja, descripcion, fecha, estado FROM quejas WHERE id_usuario = ?`,
                [id_usuario]
            )

            if(response.length === 0) return { success: false, message: 'El usuario no tiene quejas' }
            
            const formatearFecha = (fecha) => {
                return fecha.toISOString().split('T')[0];
            };

            const usuariosFormateados = response.map(usuario => {
                return {
                    ...usuario,
                    fecha: formatearFecha(new Date(usuario.fecha)),
                };
            });
            
            return { success: true, message: usuariosFormateados }
        } catch (e) { return { success: false, message: e } }
    }

    async obtenerQuejasAdmin() {
        try {
            const [response] = await pool.promise().query(
                `
                    SELECT q.id_queja, q.tipo_queja, q.descripcion, q.fecha, q.estado, u.id_usuario, u.username
                    FROM quejas q
                    LEFT JOIN usuario u ON q.id_usuario = u.id_usuario
                `
            )

            if(response.length === 0) { return { success: false, message: 'No hay quejas' } }
            
            const formatearFecha = (fecha) => {
                return fecha.toISOString().split('T')[0];
            };

            // console.log(response)
            const usuariosFormateados = response.map(usuario => {
                return {
                    ...usuario,
                    fecha: formatearFecha(new Date(usuario.fecha)),
                };
            });

            return { success: true, message: usuariosFormateados }
        } catch(e) { return  { success: false, message: e } }
    }

    async modificarEstadoQueja(id_queja, nuevo_estado) {
        const connection = await pool.promise().getConnection();
        try {
            await connection.beginTransaction();
    
            const [queja] = await connection.query(
                `SELECT estado FROM quejas WHERE id_queja = ?`,
                [id_queja]
            );
    
            if (queja.length === 0) {
                await connection.rollback();
                return { success: false, message: 'No existe la queja' };
            }
    
            const estadoActual = queja[0].estado;
    
            const transicionesPermitidas = {
                'PENDIENTE': ['RESUELTO', 'RECHAZADO'],
                'RESUELTO': [],
                'RECHAZADO': []
            };
    
            if (!transicionesPermitidas[estadoActual].includes(nuevo_estado)) {
                await connection.rollback();
                return { success: false, message: `No se puede cambiar el estado de '${estadoActual}' a '${nuevo_estado}'` };
            }
    
            const [response] = await connection.query(
                `UPDATE quejas SET estado = ? WHERE id_queja = ?`,
                [nuevo_estado, id_queja]
            );
    
            if (response.affectedRows === 0) {
                await connection.rollback();
                return { success: false, message: 'Error al modificar el estado' };
            }
    
            await connection.commit();
            return { success: true, message: 'Estado de la queja modificado exitosamente' };
        } catch (e) {
            await connection.rollback();
            return { success: false, message: e.message };
        } finally {
            connection.release();
        }
    }
    
}

module.exports = {
    GestionQuejas
}