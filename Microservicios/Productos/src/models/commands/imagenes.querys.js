const { pool } = require("../../config/db")
const { sendImageS3 } = require("../../config/sendImageS3")

class GestionImagenes {
    async agregarImagen(id_producto, imagen) {
        try {
            const [verificarExisteProducto] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM productos WHERE id_producto = ?`,
                [id_producto]
            )

            if(verificarExisteProducto[0].count === 0) { return { success: false, message: 'Producto no existente' } }

            const image = await sendImageS3(id_producto, imagen)
            if(!image.success) { return { success: false, message: image.message } }
            
            const [result] = await pool.promise().query(
                `INSERT INTO productos_imagenes(id_producto, url_imagen) VALUES(?,?)`,
                [id_producto, image.path]
            )

            if (result.affectedRows === 0) { return { success: false, message: 'Error al insertar en la tabla la imagen' } }
            return { success: true, message: 'Imagen agregada al producto exitosamente' }
        } catch(e) { return { success: false, message: e } }
    }
    
    async eliminarImagen(id_imagen) {
        try {
            console.log(id_imagen)
            const [verificarExistencia] = await pool.promise().query(
                `SELECT COUNT(*) AS count FROM productos_imagenes WHERE id_imagen = ?`,
                [id_imagen]
            )

            if(verificarExistencia[0].count === 0) { return { success: false, message: 'No existe id de la imagen' } }

            const [result] = await pool.promise().query(
                `DELETE FROM productos_imagenes WHERE id_imagen = ?`,
                [id_imagen]
            )

            if(result.affectedRows === 0) { return { success: false, message: 'Error al eliminar la imagen' } }
            return { success: true, message: "Imagen borrada exitosamente" }
        } catch(e) { return { success: false, message: e } }
    }
}

module.exports = {
    GestionImagenes,
}