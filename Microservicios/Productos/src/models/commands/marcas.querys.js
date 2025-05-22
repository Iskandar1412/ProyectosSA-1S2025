const { pool } = require("../../config/db")

class GestionMarcas {
    async agregarMarcas(nombre) {
        try {
            const [verificarMarca] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM marcas m WHERE m.nombre = ?`,
                [nombre]
            )

            if(verificarMarca[0].count !== 0) {
                return { success: false, message: 'Marca existente' }
            }

            const [insertar] = await pool.promise().query(
                `INSERT INTO marcas(nombre) VALUES(?)`,
                [nombre]
            )

            return { success: true }
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerMarcas() {
        try {
            const [resultado] = await pool.promise().query(`SELECT * FROM marcas ORDER BY nombre`);

            // console.log(resultado)
            if(resultado.length === 0) { return { success: true, message: [] } }
            return { success: true, message: resultado }
        } catch(e) { return { success: false, message: e } }
    }

    async eliminarMarca(id) {
        try {
            const [busqueda] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM marcas WHERE id_marca = ?`,
                [id]    
            )

            if(busqueda[0].count === 0) return { success: false, message: "id de marca no encontrado" }
             
            await pool.promise().query(
                `DELETE FROM marcas WHERE id_marca = ?`,
                [id]
            )

            return { success: true, message: 'Marca eliminada exitosamente' }
        } catch (e) { return { success: false, message: e } }
    }

    async actualizarMarca(id, nombre) {
        try {
            const [busqueda] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM marcas WHERE id_marca = ?`,
                [id]
            )

            if(busqueda[0].count === 0) return { success: false, message: "id de marca no encontrado" }

            const [modificar] = await pool.promise().query(
                `UPDATE marcas SET nombre = ? WHERE id_marca = ? AND nombre != ?`,
                [nombre, id, nombre]
            )

            if(modificar.affectedRows === 0) return { success: false, message: 'No se puede cambiar el nombre del producto por el mismo' }

            return { success: true, message: "Marca actualizada con éxito" }
        } catch (e) { return { success: false, message: e } }
    }
}

module.exports = {
    GestionMarcas,
}