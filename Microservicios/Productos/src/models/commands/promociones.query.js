const { pool } = require("../../config/db")

class GestionPromociones {
    async agregarPromocion(porcentaje) {
        try  {
            const [existente] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM promociones WHERE porcentaje = ?`,
                [porcentaje]
            )
            
            if(existente[0].count !== 0) return { success: false, message: 'Ya existe el porcentaje de descuento' }

            if(porcentaje >= 100) return { success: false, message: 'No puede haber un porcentaje por encima del 100%' }

            await pool.promise().query(
                `INSERT INTO promociones(porcentaje) VALUES(?)`,
                [porcentaje]
            )

            return { success: true, message: 'Porcentaje agregado' }
        } catch (e) { return { success: false, message: e } }
    }

    async modificarPromocion(id_promocion, porcentaje) {
        try  {
            const [existente] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM promociones WHERE id_promocion = ?`,
                [id_promocion]
            )

            if(existente[0].count === 0) return { success: false, message: 'Descuento promocion no encontrada' }
            
            const [verificar] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM promociones WHERE id_promocion != ? AND porcentaje = ?`,
                [id_promocion, porcentaje]
            )

            if(verificar[0].count > 0) return { success: false, message: 'Ya existe el porcentaje de descuento' }

            if(porcentaje >= 100) return { success: false, message: 'No puede haber un porcentaje por encima del 100%' }

            await pool.promise().query(
                `UPDATE promociones SET porcentaje = ? WHERE id_promocion = ?`,
                [porcentaje, id_promocion]
            )

            return { success: true, message: 'Porcentaje modificado' }
        } catch (e) { return { success: false, message: e } }
    }

    async obtenerPromociones() {
        try {
            const [result] = await pool.promise().query('SELECT * FROM promociones ORDER BY porcentaje ASC')
            
            if(result.length === 0) return { success: true, message: [] }
            return { success: true, message: result }
        } catch(e) { return { success: false, message: e } }
    }

    async elminarPromocion(id_promocion) {
        try {
            const [existente] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM promociones WHERE id_promocion = ?`,
                [id_promocion]
            )

            if(existente[0].count === 0) return { success: false, message: 'Descuento promocion no encontrada' }
            
            await pool.promise().query(
                `DELETE FROM promociones WHERE id_promocion = ?`,
                [id_promocion]
            )

            return { success: true, message: 'Promocion eliminada' }
        } catch(e) { return { success: false, message: e } }
    }

    async agregarProductoPromocion(id_producto, id_promocion, fecha_inicio, fecha_fin) {
        try {
            const [existente] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM promocion_productos WHERE id_producto = ?`,
                [id_producto]
            )

            if(existente[0].count > 0) return { success: false, message: 'El producto puede tener una única promoción' }
            
            const [productosExistentes] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM productos WHERE id_producto = ?`,
                [id_producto]
            )

            if(productosExistentes[0].count === 0) return { success: false, message: 'El producto no existe' }
            
            const [promocionExistente] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM promociones WHERE id_promocion = ?`,
                [id_promocion]
            )

            if(promocionExistente[0].count === 0) return { success: false, message: 'La promocion no existe' }
            
            await pool.promise().query(
                `INSERT INTO promocion_productos(id_producto, id_promocion, fecha_inicio, fecha_fin) VALUES(?,?,?,?)`,
                [id_producto, id_promocion, fecha_inicio, fecha_fin]
            )

            return { success: true, message: 'Promoción agregada exitosamente al producto' } 
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerProductosPromociones() {
        try {
            const [result] = await pool.promise().query(
                `
                    SELECT pp.id_promocion_producto, pp.id_producto, p.nombre AS nombre_producto, pp.id_promocion, pro.porcentaje, pp.fecha_inicio, pp.fecha_fin
                    FROM promocion_productos pp
                    JOIN productos p ON p.id_producto = pp.id_producto
                    JOIN promociones pro ON pro.id_promocion = pp.id_promocion
                    ORDER BY id_producto ASC
                `
            )
            
            if(result.length === 0) return { success: true, message: [] }
            return { success: true, message: result }
        } catch(e) { return { success: false, message: e } }
    }

    async modificarProductoPromocion(id_promocion_producto, id_promocion, fecha_inicio, fecha_fin) {
        try {
            const [existente] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM promocion_productos WHERE id_promocion_producto = ?`,
                [id_promocion_producto]
            )

            if(existente[0].count === 0) return { success: false, message: 'No se ha encontrado el produto con promoción' }
            
            const [promocionExistente] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM promociones WHERE id_promocion = ?`,
                [id_promocion]
            )

            if(promocionExistente[0].count === 0) return { success: false, message: 'La promocion no existe' }

            await pool.promise().query(
                `
                    UPDATE promocion_productos SET  id_promocion = ?, fecha_inicio = ?, fecha_fin = ?
                    WHERE id_promocion_producto = ?
                `,
                [id_promocion, fecha_inicio, fecha_fin, id_promocion_producto]
            )

            return { success: true, message: 'Modificada la promoción del producto' } 
        } catch(e) { return { success: false, message: e } }
    }

    async eliminarProductoPromocion(id_promocion_producto) {
        try {
            const [existente] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM promocion_productos WHERE id_promocion_producto = ?`,
                [id_promocion_producto]
            )

            if(existente[0].count === 0) return { success: false, message: 'No se ha encontrado el produto con promoción' }
            
            await pool.promise().query(
                `DELETE FROM promocion_productos WHERE id_promocion_producto = ?`,
                [id_promocion_producto]
            )

            return { success: true, message: 'Promoción al producto eliminada exitosamente' } 
        } catch(e) { return { success: false, message: e } }
    }
}

module.exports = {
    GestionPromociones
}