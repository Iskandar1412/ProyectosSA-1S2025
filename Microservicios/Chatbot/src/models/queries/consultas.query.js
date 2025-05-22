const pool_productos = require("../../config/db_productos");
const pool_usuarios = require("../../config/db_usuarios");
const pool_chatbot = require("../../config/db_chatbot");
const pool_compras = require("../../config/db_compras");
const pool_devoluciones = require("../../config/db_devoluciones");

function formatearInformeProducto(productos) {
    if (!Array.isArray(productos) || productos.length === 0) {
        return 'No se encontró información del producto.';
    }
    const p = productos[0];
    let regiones = '';
    if (Array.isArray(p.regiones) && p.regiones.length > 0) {
        regiones = '- Regiones: ' + p.regiones.map(r => r.region_nombre).join(', ');
    }
    return (
        `🔎 Producto encontrado:\n\n- Nombre: ${p.nombre}\n- Marca: ${p.marca}\n- Categoría: ${p.categoria}\n- Código: ${p.codigo_producto}\n- Promoción: ${p.promociones.length > 0 ? p.promociones[0].porcentaje_promocion + '%' : 'N/A'}\n- Precio: Q${p.precio}\n- Existencias: ${p.cantidad}\n` +
        regiones + '\n'
    );
}

function formatearInformeDevolucion(devolucion) {
    if (!Array.isArray(devolucion) || devolucion.length === 0) {
        return 'No se encontró información de la devolución.';
    }
    const p = devolucion[0];
    // console.log(p)
    return (
        `🔎 Devolución encontrada:\n\n` +
        `- ID: ${p.id_devolucion}\n` + 
        `- Cod Producto: ${p.codigo_producto}\n` +
        `- Estado Devolución: ${p.estado}\n` +
        `- Cantidad: ${p.cantidad}\n` +
        `- Motivo de Devolución: ${p.motivo_devolucion}\n` +
        `- Fecha Solicitud: ${p.fecha_devolucion}\n` +
        `- Precio Unitario: Q${p.precio_producto}\n` +
        `- Total: Q${p.precio_total}\n`
    );
}

function formatearInformePedido(compra) {
    if (!compra) {
        return 'No se encontró información del pedido.';
    }
    const p = compra[0]
    let productos = '';
    if (Array.isArray(p.productos) && p.productos.length > 0) {
        productos = p.productos.map(prod =>
            `    - ${prod.nombre_producto} (x${prod.cantidad}) - Q${prod.precio_unitario}${prod.promocion ? ` [Promo: ${prod.promocion}]` : ''}`
        ).join('\n');
    } else {
        productos = '    • Sin productos en este pedido.';
    }
    return (
        `🧾 Detalle del Pedido\n\n` +
        `* ID Orden: ${p.id_orden}\n` +
        `* Fecha: ${p.fecha_orden.split(' ')[0]}\n` +
        `* Estado: ${p.estado}\n` +
        `* Subtotal: Q${p.subtotal}\n` +
        `* Cupón Descuento: ${p.cupon_descuento ? p.cupon_descuento : 'N/A'}\n` +
        `* Total: Q${p.total}\n` +
        `* Productos:\n${productos}\n`
    );
}

class GestionChatbot {
    async guardarPeticiones(user_id, sender, message) {
        const [response] = await pool_chatbot.query(
            `
                INSERT INTO chat_history (user_id, sender, message)
                VALUES (?,?,?)
            `,
            [user_id, sender, message]
        );
        return response;
    }
    
    async obtenerProductos(producto, id_usuario, message) {
        try {
            await this.guardarPeticiones(id_usuario, 'user', message)
            const [response] = await pool_productos.query(
                `
                    SELECT JSON_OBJECT(
                        'codigo_producto', p.codigo,
                        'categoria', c.nombre,
                        'marca', m.nombre,
                        'precio', p.precio,
                        'nombre', p.nombre,
                        'cantidad', p.cantidad,
                        'promociones', COALESCE (
                            (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'porcentaje_promocion', pro.porcentaje
                                    ) 
                                ) 
                                FROM promocion_productos pp
                                JOIN promociones pro ON pro.id_promocion = pp.id_promocion
                                WHERE pp.id_producto = p.id_producto AND (? BETWEEN pp.fecha_inicio AND pp.fecha_fin)
                            ),
                            JSON_ARRAY() 
                        ),
                        'regiones', COALESCE(
                            (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'region_nombre', reg.nombre
                                    )
                                )
                                FROM productos_region pr
                                JOIN regiones reg ON reg.id_region = pr.id_region
                                WHERE pr.id_producto = p.id_producto
                                ORDER BY reg.nombre ASC
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Productos
                    FROM productos p
                    JOIN categorias c ON p.id_categoria = c.id_categoria
                    JOIN marcas m ON m.id_marca = p.id_marca
                    WHERE p.id_producto = ? OR p.codigo = ?
                    ORDER BY p.nombre ASC
                `,
                [new Date(), producto, producto]
            )
            
            await this.guardarPeticiones(id_usuario, 'bot', response.length === 0 ? 'Producto no encontrado' : formatearInformeProducto(response.map(row => row.Productos)))
            if(response.length === 0) { return { success: false, message: 'Producto no encontrado' } }
            const productos = response.map(row => row.Productos);
    
            return { success: true, message: formatearInformeProducto(productos) }
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerPedidos(pedido, id_usuario, message) {
        try {
            await this.guardarPeticiones(id_usuario, 'user', message)
            const [response] = await pool_compras.query(
                `
                    SELECT JSON_OBJECT(
                        'id_orden', o.id_orden,
                        'correo_usuario', o.correo_usuario,
                        'fecha_orden', o.fecha_orden,
                        'estado', o.estado,
                        'subtotal', o.subtotal,
                        'cupon_descuento', o.cupon_descuento,
                        'total', o.total,
                        'productos', IFNULL(
                            JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'id_producto', po.id_producto,
                                    'cantidad', po.cantidad,
                                    'promocion', po.promocion,
                                    'codigo_producto', po.codigo_producto,
                                    'precio_unitario', po.precio_unitario,
                                    'nombre_producto', po.nombre_producto
                                )
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Compras
                    FROM ordenes o
                    LEFT JOIN productos_orden po ON o.id_orden = po.id_orden
                    WHERE o.id_usuario = ? AND o.id_orden = ?
                    GROUP BY o.id_orden
                `,
                [id_usuario, pedido]
            )
    
            await this.guardarPeticiones(id_usuario, 'bot', response.length === 0 ? 'Orden no encontrada' : formatearInformePedido(response.map(row => row.Compras)))
            if(response.length === 0) { return { success: false, message: 'Orden no encontrada' } }
            const productos = response.map(row => row.Compras);
    
            return { success: true, message: formatearInformePedido(productos) }
        } catch(e) { return { success: false, message: e } }
    }

    async obtenerDevoluciones(devolucion, id_usuario, message) {
        try {
            await this.guardarPeticiones(id_usuario, 'user', message)
            const [response] = await pool_devoluciones.query(
                `
                    SELECT id_devolucion, fecha_devolucion, estado, codigo_producto, cantidad, motivo_devolucion, precio_producto, precio_total
                    FROM devoluciones
                    WHERE id_usuario = ? AND id_devolucion = ?
                `,
                [id_usuario, devolucion]
            )

            await this.guardarPeticiones(id_usuario, 'bot', response.length === 0 ? 'Devolución no encontrada' : formatearInformeDevolucion(response))
            if(response.length === 0) { return { success: false, message: 'Devolución no encontrada' } }
            // console.log(formatearInformeDevolucion(response))
            return { success: true, message: formatearInformeDevolucion(response) }
        } catch(e) { return { success: false, message: e } }
    }
    
    async agregarCarrito(id_usuario, elemento, producto, cantidad, message) {
        // console.log(id_usuario, elemento, producto, cantidad, message)
        try {
            await this.guardarPeticiones(id_usuario, 'user', message)
            const [usuarioRes] = await pool_usuarios.query(
                `
                    SELECT JSON_OBJECT(
                        'id_usuario', u.id_usuario,
                        'nombre', u.nombre,
                        'correo', u.correo,
                        'usuario', u.username,
                        'direcciones', IFNULL(
                            JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'ciudad', d.ciudad
                                )
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Usuarios
                    FROM usuario u
                    LEFT JOIN direccion d ON d.id_usuario = u.id_usuario
                    WHERE u.id_usuario = ?
                `,
                [id_usuario]
            )
    
            const usuarioData = usuarioRes.map(row => row.Usuarios)[0];
    
            const [productoRes] = await pool_productos.query(
                `
                    SELECT JSON_OBJECT(
                        'id_producto', p.id_producto,
                        'codigo', p.codigo,
                        'nombre', p.nombre,
                        'precio', p.precio,
                        'cantidadMaxima', p.cantidad,
                        'valor', p.valor,
                        'precioSeleccionado', p.valor,
                        'descuento', COALESCE(promo.porcentaje, 0),
                        'imagen', COALESCE((
                            SELECT pi.url_imagen
                            FROM productos_imagenes pi
                            WHERE pi.id_producto = p.id_producto
                            ORDER BY pi.id_imagen ASC
                            LIMIT 1
                        ), 'https://blog.springworks.in/wp-content/themes/fox/images/placeholder.jpg'),
                        'regiones', IFNULL(
                            JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'nombre_region', r.nombre
                                )
                            ),
                            JSON_ARRAY()
                        )
                    ) AS Producto
                    FROM productos p
                    LEFT JOIN productos_region pr ON pr.id_producto = p.id_producto
                    LEFT JOIN regiones r ON r.id_region = pr.id_region
                    LEFT JOIN promocion_productos pp ON pp.id_producto = p.id_producto
                    LEFT JOIN promociones promo ON promo.id_promocion = pp.id_promocion
                    WHERE p.id_producto = ? 
                        OR LOWER(p.codigo) = LOWER(?)
                        OR LOWER(p.nombre) LIKE CONCAT('%', LOWER(?), '%')
                `,
                [producto, elemento, elemento]
            )

            if(productoRes.length === 0) {
                await this.guardarPeticiones(id_usuario, 'bot', 'Producto no encontrado')
                return { success: false, message: 'Producto no encontrado' }
            }

            const productoData = productoRes.map(row => row.Producto)[0];
            if(!productoData.nombre) {
                await this.guardarPeticiones(id_usuario, 'bot', 'Producto no encontrado')
                return { success: false, message: 'Producto no encontrado' }
            }

            const ciudadesUsuario = (usuarioData.direcciones || []).map(dir => dir.ciudad && dir.ciudad.toLowerCase());
            const regionesProducto = (productoData.regiones || []).map(reg => reg.nombre_region && reg.nombre_region.toLowerCase());

            const coincideRegion = ciudadesUsuario.some(ciudad => regionesProducto.includes(ciudad));

            if (!coincideRegion) {
                await this.guardarPeticiones(id_usuario, 'bot', 'El producto no está disponible en tu región')
                return { success: false, message: 'El producto no está disponible en tu región' };
            }

            if(cantidad > productoData.cantidad) {
                await this.guardarPeticiones(id_usuario, 'bot', 'No hay suficiente stock')
                return { success: false, message: 'No hay suficiente stock' };
            }

            const { regiones, ...productoSinRegiones } = productoData;
            await this.guardarPeticiones(id_usuario, 'bot', `Producto Agregado: \n${cantidad} unidades\nProducto ${productoData.nombre}`)
            return { success: true, message: `Producto Agregado: \n${cantidad} unidades\nProducto ${productoData.nombre}`, producto: productoSinRegiones, cantidad: cantidad };
        } catch (e) { return { success: false, message: e } }
    }

    async obtenerChat(id_usuario) {
        try {
            const [response] = await pool_chatbot.query(
                `
                    SELECT * FROM chat_history WHERE user_id = ? ORDER BY id ASC
                `,
                [id_usuario]
            )
            
            if(response.length === 0) { return { success: true, message: [] } }

            return { success: true, message: response }
        } catch (e) { return { success: false, message: e } }
    }
}

module.exports = {
    GestionChatbot
};
