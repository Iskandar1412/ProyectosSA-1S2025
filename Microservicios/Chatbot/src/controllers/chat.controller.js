const { GestionChatbot } = require('../models/queries/consultas.query');
const { interpretarPreguntaWit } = require('../utils/wit.service');

function extraerDatosWit(entities) {
    const parametros = {};
    for (const key in entities) {
        const cleanKey = key.includes(":") ? key.split(":").pop() : key;
        parametros[cleanKey] = entities[key].map(ent =>
            typeof ent.value !== 'undefined' ? ent.value : ent.body
        );
        if (parametros[cleanKey].length === 1) {
            parametros[cleanKey] = parametros[cleanKey][0];
        }
    }
    return parametros;
}

const chatFunction = async (req, res, next) => {
    const usuarioID = req.user.id;
    try {
        const { message } = req.body;
        if (!message || !usuarioID) {
            return res.status(400).json({ error: 'El mensaje es requerido' });
        }

        const interpretacion = await interpretarPreguntaWit(message);
        // console.log(interpretacion.intencion);
        const parametros = extraerDatosWit(interpretacion.parametros);
        // console.log(parametros)
        let respuesta = {};
        switch (interpretacion.intencion) {
            case 'producto':
                if(parametros.number || parametros.elemento) {
                const data = await new GestionChatbot().obtenerProductos(parametros.number ? parametros.number : parametros.elemento, usuarioID, message)
                    if(data.success) {
                        respuesta = { message: data.message }
                    } else {
                        respuesta = { message: data.message }
                    }
                }
                break;
            case 'pedido':
                if(parametros.number) {
                const data = await new GestionChatbot().obtenerPedidos(parametros.number, usuarioID, message)
                    if(data.success) {
                        respuesta = { message: data.message }
                    } else {
                        respuesta = { message: data.message }
                    }
                }
                break;
            case 'devolucion':
                if(parametros.number) {
                    const data = await new GestionChatbot().obtenerDevoluciones(parametros.number, usuarioID, message)
                    if(data.success) {
                        respuesta = { message: data.message }
                    } else {
                        respuesta = { message: data.message }
                    }
                }
                break;
            case 'carrito':
                if(parametros.number.length > 1) {
                    const data = await new GestionChatbot().agregarCarrito(usuarioID, null, parametros.number[1], parametros.number[0], message)
                    if(data.success) {
                        respuesta = { message: data.message, producto: data.producto, cantidad: data.cantidad }
                    } else {
                        respuesta = { message: data.message }
                    }
                } else if (parametros.elemento && parametros.number) {
                    const data = await new GestionChatbot().agregarCarrito(usuarioID, parametros.elemento, null, parametros.number, message)
                    if(data.success) {
                        respuesta = { message: data.message, producto: data.producto, cantidad: data.cantidad }
                    } else {
                        respuesta = { message: data.message }
                    }
                } else {
                    respuesta = { message: 'Error al agregar al carro' }
                }
               
                break;
            default:
                respuesta = { message: interpretacion.error || 'No se pudo interpretar tu solicitud.' };
        }

        res.status(201).json({ success: true, message: respuesta.message, producto: respuesta.producto, cantidad: respuesta.cantidad })
    } catch (error) { next(error) }
}

const obtenerChat = async (req, res, next) => {
    const usuarioID = req.user.id;
    try {
        if(!usuarioID) {
            const error = new Error('Usuario no valido')
            error.statusCode = 403
            throw error
        }

        const data = await new GestionChatbot().obtenerChat(usuarioID)
        if(!data.success) {
            const error = new Error(data.message)
            error.statusCode = 404
            throw error
        }

        res.status(200).json({ success: true, data: data.message })
    } catch(e) { next(e) }
}


module.exports = {
    chatFunction,
    obtenerChat,
}