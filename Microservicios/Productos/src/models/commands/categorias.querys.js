const { pool } = require("../../config/db")

class GestionCategorias {
    async crearCategoria(nombre, descripcion) {
        try {
            const [verificarCategoria] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM categorias c WHERE c.nombre = ?`,
                [nombre]
            )

            if(verificarCategoria[0].count !== 0) {
                return { success: false, message: 'Categoria existente' }
            }

            await pool.promise().query(
                `INSERT INTO categorias(nombre, descripcion) VALUES(?,?)`,
                [nombre, descripcion]
            )

            return { success: true }
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerCategorias() {
        try {
            const [resultado] = await pool.promise().query(`SELECT * FROM categorias`)

            if(resultado.length === 0) { return { success: true, message: [] } }
            return { success: true, message: resultado }
        } catch (e) { return { success: false, message: e } }
    }

    async eliminarCategoria(id) {
        try {
            const [busqueda] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM categorias WHERE id_categoria = ?`,
                [id]    
            )

            if(busqueda[0].count === 0) return { success: false, message: "id de categoria no encontrado" }
             
            await pool.promise().query(
                `DELETE FROM categorias WHERE id_categoria = ?`,
                [id]
            )

            return { success: true, message: 'Categoria eliminada exitosamente' }
        } catch (e) { return { success: false, message: e } }
    }

    async actualizarCategoria(id, nombre, descripcion) {
        try {
            const [busqueda] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM categorias WHERE id_categoria = ?`,
                [id]
            )

            if(busqueda[0].count === 0) return { success: false, message: "id de categoria no encontrado" }

            const [modificar] = await pool.promise().query(
                `UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ? AND (nombre != ? OR descripcion != ?)`,
                [nombre, descripcion, id, nombre, descripcion]
            )
            
            if(modificar.affectedRows === 0) return { success: false, message: 'No se puede cambiar el nombre o descripción de la categoria por el mismo' }

            return { success: true, message: "Categoria actualizada con éxito" }
        } catch (e) { return { success: false, message: e } }
    }
}

module.exports = {
    GestionCategorias,
}