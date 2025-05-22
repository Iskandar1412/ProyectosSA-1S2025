const { pool } = require("../../config/db")

class GestionPagos {
    async agregarPago(id_compra, id_usuario, usuario, tipo_pago_1, no_tarjeta_1, porcentaje_1, tipo_pago_2, no_tarjeta_2, porcentaje_2, subtotal, cupon_descuento, total) {
        try {
            const [obtenerIDUltimo] = await pool.promise().query(`SELECT MAX(id_pago) as Max FROM pagos`)
            if(!obtenerIDUltimo[0].Max) { obtenerIDUltimo[0].Max = 0 }
            
            function generarCodigo(valor) {
                const formateo = String(valor + 1).padStart(6, '0');
                return `CP-${formateo}`
            }
            const codigo = generarCodigo(obtenerIDUltimo[0].Max)
            // console.log('aqui pasamos', codigo)

            // console.log(codigo, id_compra, id_usuario, usuario, new Date(), tipo_pago_1, no_tarjeta_1, porcentaje_1, tipo_pago_2, no_tarjeta_2, porcentaje_2, subtotal, cupon_descuento, total)
            await pool.promise().query(
                `
                    INSERT INTO pagos(codigo_pago, id_compra, id_usuario, usuario, fecha_pago, tipo_pago_1, no_tarjeta_1, porcentaje_1, tipo_pago_2, no_tarjeta_2, porcentaje_2, subtotal, cupon_descuento, total)
                    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                `,
                [codigo, id_compra, id_usuario, usuario, new Date(), tipo_pago_1, no_tarjeta_1, porcentaje_1, tipo_pago_2, no_tarjeta_2, porcentaje_2, subtotal, cupon_descuento, total]
            )

            return { success: true, message: 'Exito al agregar pago' }
        } catch (e) { return { success: false, message: e } }
    }

    async obtenerPagosUsuario(id_usuario) {
        try {
            const [buscar] = await pool.promise().query(
                `
                    SELECT codigo_pago, id_compra, fecha_pago, tipo_pago_1, no_tarjeta_1, porcentaje_1, tipo_pago_2, no_tarjeta_2, porcentaje_2, subtotal, cupon_descuento, total
                    FROM pagos
                    WHERE id_usuario = ?
                `,
                [id_usuario]
            )
            // console.log(buscar.length)
            if (buscar.length === 0) return { success: true, message: [] }

            const formatearFecha = (fecha) => {
                return fecha.toISOString().split('T')[0];
            };

            const pagosToSend = buscar.map(usuario => {
                return {
                    ...usuario,
                    fecha_pago: formatearFecha(new Date(usuario.fecha_pago))
                };
            });

            return { success: true, message: pagosToSend }
        } catch (e) { return { success: false, message: e } }
    }

    async obtenerPagosAdmin() {
        try {
            const [buscar] = await pool.promise().query(
                `
                    SELECT codigo_pago, id_compra, usuario, fecha_pago, tipo_pago_1, no_tarjeta_1, porcentaje_1, tipo_pago_2, no_tarjeta_2, porcentaje_2, subtotal, cupon_descuento, total
                    FROM pagos
                `
            )

            if (buscar.length === 0) return { success: true, message: 'No hay transacciones de usuarios' }
            return { success: true, message: buscar }
        } catch (e) { return { success: false, message: e } }
    }
}

module.exports = {
    GestionPagos
}