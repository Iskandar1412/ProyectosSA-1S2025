const { pool } = require("../../config/db");

class GestionDescuentos {
    async agregarDescuento(min, max, porcentaje) {
        try {
            const [buscar] = await pool.promise().query(
                `
                    SELECT COUNT(*) AS count 
                    FROM descuentos 
                    WHERE (rango_compra_min BETWEEN ? AND ? OR rango_compra_max BETWEEN ? AND ?)
                `,
                [min, max, min, max]
            );
    
            if (buscar[0].count > 0) return { success: false, message: 'El rango de descuento ya existe.' };
            
            await pool.promise().query(
                `INSERT INTO descuentos(rango_compra_min, rango_compra_max, porcentaje_descuento) VALUES(?,?,?)`,
                [min, max, porcentaje]
            )

            return { success: true, message: 'Descuento Agregado exitosamente' };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    async obtenerDescuentos() {
        try {
            const [response] = await pool.promise().query(`SELECT * FROM descuentos ORDER BY porcentaje_descuento ASC`)
            if(!response.length) return { success: true, message: [] }
            return { success: true, message: response}
        } catch(e) { return { success: false, message: e } }
    }

    async modificarDescuento(id, min, max, porcentaje) {
        try {
            const [buscar] = await pool.promise().query(
                `
                    SELECT COUNT(*) AS count 
                    FROM descuentos 
                    WHERE (rango_compra_min BETWEEN ? AND ? OR rango_compra_max BETWEEN ? AND ?) AND id_descuento != ?
                `,
                [min, max, min, max, id]
            );

            if (buscar[0].count > 0) return { success: false, message: 'El rango de descuento ya existe.' };
            
            const [response] = await pool.promise().query(
                `
                    UPDATE descuentos
                    SET rango_compra_min = ?, rango_compra_max = ?, porcentaje_descuento = ?
                    WHERE id_descuento = ?
                `,
                [min, max, porcentaje, id]
            )

            if(response.affectedRows === 0) return { success: false, message: 'Error al actualizar el descuento' }
            return { success: true, message: 'Descuento actualizado exitosamente' }
        } catch(e) { return { success: false, message: e } }
    }

    async eliminarDescuento(id) {
        try {
            const [buscar] = await pool.promise().query(`SELECT COUNT(*) AS count FROM descuentos WHERE id_descuento = ?`, [id])
            if(buscar[0].count === 0) return { success: false, message: "Descuento no encontrado" }

            await pool.promise().query(`DELETE FROM descuentos WHERE id_descuento = ?`, [id])
            return { success: true, message: 'Descuento eliminado exitosamente' }
        } catch(e) { return { success: false, message: e } }
    }
}

module.exports = {
    GestionDescuentos
}