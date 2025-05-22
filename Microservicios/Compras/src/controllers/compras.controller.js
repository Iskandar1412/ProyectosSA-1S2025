const SendMail = require("../config/mail");
const { GestionCompras } = require("../models/commands/compras.query")

const generarHtmlCorreo = (carrito, subtotal, descuento, total) => {
    const filasProductos = carrito.map(producto => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${producto.nombre}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${producto.codigo}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${producto.cantidad}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${producto.precio.toFixed(2)} Q</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${producto.descuento}%</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${(producto.precio * producto.cantidad * (1 - producto.descuento / 100)).toFixed(2)} Q</td>
        </tr>
    `).join('');

    return `
        <p>Estimado/a <strong>Usuario</strong>,</p>
        <p>Gracias por su compra. A continuación, se detallan los productos adquiridos:</p>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Producto</th>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Código</th>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Cantidad</th>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Precio Unitario</th>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Descuento</th>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${filasProductos}
            </tbody>
        </table>
        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)} Q</p>
        <p><strong>Descuento aplicado:</strong> ${descuento.toFixed(2)} %</p>
        <p><strong>Total a pagar:</strong> ${total.toFixed(2)} Q</p>
        <p>Si tiene alguna pregunta o necesita asistencia adicional, no dude en ponerse en contacto con nosotros.</p>
        <p>¡Gracias por su confianza!</p>
    `;
};

const agregarCoprasUsuarios = async (req, res, next) => {
    const { id_usuario, correo_usuario, total_pagar, descuento, sub_total, carrito } = req.body;
    // console.log(id_usuario, correo_usuario, total_pagar, descuento, sub_total, carrito)
    try {
        if(!id_usuario || !correo_usuario || !total_pagar || !sub_total || !carrito) {
            const error = new Error('Datos invalidos')
            error.statusCode = 402
            throw error
        }

        const data = await new GestionCompras().agregarCompra(id_usuario, correo_usuario, total_pagar, descuento !== null ? descuento : 0, sub_total, carrito)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 402
            throw error
        }

        const htmlSend = generarHtmlCorreo(carrito, sub_total, descuento !== null ? Number(descuento) : 0, total_pagar);
        const usuario = await SendMail(correo_usuario, `Detalles compra`, htmlSend);
        if (!usuario.success) {
            const error = new Error(usuario.message)
            error.statusCode = 402
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { 
        console.log(e.message)
        next(e) }
}

const obtenerComprasAdmin = async (req, res, next) => {
    try {
        const response = await new GestionCompras().obtenerComprasAdmin()
        if(!response.success) {
            const error = new Error(response.message)
            error.statusCode = 402
            throw error
        }

        res.status(200).json({ success: true, message: response.message })
    } catch(e) { next(e) }
}

const obtenerComprasUser = async (req, res, next) => {
    const user = req.user.id
    try {
        const response = await new GestionCompras().obtenerComprasUsuario(user)
        if(!response.success) {
            const error = new Error(response.data)
            error.statusCode = 402
            throw error
        }

        res.status(200).json({ success: true, message: response.message })
    } catch(e) { next(e) }
}

const modificarEstadoOrden = async  (req, res, next) => {
    const { id_orden, estado } = req.body
    try {
        if(!id_orden || !estado) {
            const error = new Error('Campos no validos')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionCompras().modificarEstadoCompra(id_orden, estado)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 401
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { 
        console.log(e.message)
        next(e) }
}

const obtenerHistorial = async (req, res, next) => {
    const usuario = req.user.id
    try {
        const data = await new GestionCompras().obtenerHistorial(usuario)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 402
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

const obtenerHistorialProductosEntregados = async (req, res, next) => {
    const usuario = req.user.id
    try {
        const data = await new GestionCompras().obtenerHistorialFinal(usuario)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 402
            throw error
        }

        res.status(201).json({ success: true, message: data.message })
    } catch(e) { next(e) }
}

module.exports = {
    agregarCoprasUsuarios,
    obtenerComprasAdmin,
    obtenerComprasUser,
    modificarEstadoOrden,
    obtenerHistorial,
    obtenerHistorialProductosEntregados,
}