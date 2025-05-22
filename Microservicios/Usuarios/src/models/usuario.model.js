const pool = require('../config/db');
const SendMail = require('../config/mail');
const { sendImageS3 } = require('../config/sendImageS3');
const { encrypt, decrypt } = require('../utils/encryption');
const bcrypt = require('bcrypt'); // npm i bcrypt
const { Usuario } = require('./index');

const UserModel = {
    CodigoVerificacion: () => {
        const verificacionCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracionCode = Date.now() + 2 * 60 * 1000;
        return {verificacion: verificacionCode, expiracion: expiracionCode}
    },

    BuscarUsuario: async(credenciales) => {
        const [response] = await pool.query('CALL buscar_usuario(?)', [encrypt(credenciales)]);
        resultado = response[0][0];
        if(resultado && resultado.id !== null) {
            resultado.correo = decrypt(resultado.correo);
            resultado.username = decrypt(resultado.username);
            return resultado;
        }
        return null;
    },

    ObtenerUsuario: async (id) => {
        const [response] = await pool.query('CALL obtener_usuario(?)', [id]);
        resultado = response[0][0].datos_usuario;
        if(resultado && resultado.id !== null) {
            resultado.correo = decrypt(resultado.correo);
            resultado.nombre = decrypt(resultado.nombre);
            resultado.apellido = decrypt(resultado.apellido);
            resultado.telefono = decrypt(resultado.telefono);
            resultado.username = decrypt(resultado.username);
            return resultado;
        }
        return null;
    },

    CrearCuentaUsuario: async (nombre, apellido, correo, username, telefono, genero, fecha_nacimiento, url, contrasenia, ciudad, departamento) => {
        const nombreEncriptado = encrypt(nombre);
        const apellidoEncriptado = encrypt(apellido);
        const correoEncriptado = encrypt(correo);
        const usuarioEncriptado = encrypt(username);
        const telefonoEncriptado = encrypt(telefono);

        const rondas = 10;
        const hashPassword = await bcrypt.hash(contrasenia, rondas);
        const imagen = await sendImageS3(username, url);
        const { verificacion, expiracion } = UserModel.CodigoVerificacion();
        const [response] = await pool.query('CALL registrar_usuario(?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [nombreEncriptado, apellidoEncriptado, correoEncriptado, usuarioEncriptado, telefonoEncriptado, genero, fecha_nacimiento, imagen.path, hashPassword, verificacion, expiracion, ciudad, departamento]
        );

        const htmlSend = `<p><strong>${username}</strong>: Su cuenta fue creada exitosamente</br><strong>Código activación:</strong> ${verificacion}</br></br>Tiene 2 minutos para el ingreso de la verificación; inicie sesión para activar su cuenta.</br></br>Bienvenido!! :D</p>`
        const usuario = await SendMail(correo, `${username}: Cuenta Creada exitosamente`, htmlSend);
        if (!usuario.success) {
            return null;
        }
        return response;
    },

    CrearCuentaAdministrador: async (nombre, apellido, correo, username, telefono, genero, fecha_nacimiento, url, contrasenia, ciudad, departamento) => {
        const nombreEncriptado = encrypt(nombre);
        const apellidoEncriptado = encrypt(apellido);
        const correoEncriptado = encrypt(correo);
        const usuarioEncriptado = encrypt(username); 
        const telefonoEncriptado = encrypt(telefono); 

        const rondas = 10;
        const hashPassword = await bcrypt.hash(contrasenia, rondas);
        const imagen = await sendImageS3(username, url);
        const { verificacion, expiracion } = UserModel.CodigoVerificacion();
        const [response] = await pool.query('CALL registrar_administrador(?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [nombreEncriptado, apellidoEncriptado, correoEncriptado, usuarioEncriptado, telefonoEncriptado, genero, fecha_nacimiento, imagen.path, hashPassword, verificacion, expiracion, ciudad, departamento]
        );

        const htmlSend = `<p><strong>${username}</strong>: Su cuenta fue creada exitosamente</br><strong>Código activación:</strong> ${verificacion}</br></br>Tiene 2 minutos para el ingreso de la verificación; inicie sesión para activar su cuenta.</br></br>Bienvenido!! :D</p>`
        const usuario = await SendMail(correo, `${username}: Cuenta Creada exitosamente`, htmlSend);
        if (!usuario.success) {
            return null;
        }
        return response;
    },

    ActivarCuenta: async (id, codigo) => {
        try {
            const usuario = await Usuario.findByPk(id);
            if(!usuario) return { success: false, message: "Error en la obtención del usuario" };

            if (usuario.codigo_activacion !== codigo) return { success: false, message: "Codigo no valido" };

            const ahora = Date.now();
            if (usuario.tiempo_expiracion_codigo <= ahora) return { success: false, message: 'Error: Código expirado, reenvie otro código' };

            const response = await Usuario.update({
                verificacion_correo: true,
                codigo_activacion: null,
                tiempo_expiracion_codigo: null
            }, {
                where: {
                    id: id
                }
            });

            const htmlSend = `<p><strong>${decrypt(usuario.username)}</strong>: Su cuenta ha sido activada exitosamente<strong></p>`
            const correoEnviar = await SendMail(decrypt(usuario.correo), `${decrypt(usuario.username)}: Cuenta activada Exitosamente`, htmlSend);
            if (!correoEnviar.success) {
                return { success: false, message: 'Error en el envio del correo' };
            }
            return { success: true }
        } catch(e) {
            return { success: false, message: e }
        }
    },

    ReenviarCodigoActivacion: async (id) => {
        const { verificacion, expiracion } = UserModel.CodigoVerificacion();
        try {
            const usuarioExistente = await Usuario.findByPk(id)
            if(!usuarioExistente) return { success: false, mmessage: 'Error en la obtención del usuario' };
            
            const response = await Usuario.update({
                codigo_activacion: verificacion,
                tiempo_expiracion_codigo: expiracion
            }, {
                where: {
                    id: id
                }
            });

            const htmlSend = `<p><strong>${decrypt(usuarioExistente.username)}</strong>: Cambio de <strong>Código activación:</strong> ${verificacion}</br></br>Tiene 2 minutos para el ingreso de la verificación.</p>`
            const usuario = await SendMail(decrypt(usuarioExistente.correo), `${decrypt(usuarioExistente.username)}: Cambio de código de activación`, htmlSend);
            if (!usuario.success) {
                return null;
            }
            return { success: true }
        } catch (e) {
            return { success: false, message: e }
        }
    },

    AgregarTokenUsuario: async (credenciales, tok) => {
        const [response] = await pool.query('CALL agregar_token(?,?)', [encrypt(credenciales), tok]);
        resultado = response[0][0];
        if(!resultado) {
            return { success: false }
        }
        return { success: true, mensaje: resultado.mensaje };
    },

    EliminarTokenUsuario: async (credenciales) => {
        const [reponse] = await pool.query('CALL borrar_token(?)', [credenciales]);
        resultado = reponse[0][0];
        if(!resultado) {
            return { success: false };
        }
        return { success: true, mensaje: resultado.mensaje };
    },

    ModificarUsuarioData: async (id, correo, telefono, direcciones) => {
        try {
            const usuario = await Usuario.findByPk(id);
            if(!usuario) return { success: false, message: 'Usuario no encontrado' };

            const [response] = await pool.query('CALL actualizar_usuario(?,?,?,?)', [id, encrypt(correo), encrypt(telefono), JSON.stringify(direcciones)]);
            resultado = response[0][0];
            if(!resultado) return  { success: false, message: "Error en el cambio de información" };
            
            return { success: true }
        } catch(e) {
            return { success: false, message: e }
        }
    },

    AdminObtenerUsuarios: async(id) => {
        try {
            const [response] = await pool.query('CALL obtener_usuarios(?)', [id]);
            resultado = response[0][0].usuarios;
            if(!resultado) return { success: false, message: 'Error en la obtención de usuario' }
            
            for(i = 0; i < resultado.length; i++) {
                resultado[i].nombre = decrypt(resultado[i].nombre);
                resultado[i].apellido = decrypt(resultado[i].apellido);
                resultado[i].correo = decrypt(resultado[i].correo);
                resultado[i].username = decrypt(resultado[i].username);
                resultado[i].telefono = decrypt(resultado[i].telefono);
                resultado[i].fecha_creacion = resultado[i].fecha_creacion.split(' ')[0];
                resultado[i].fecha_nacimiento = resultado[i].fecha_nacimiento.split(' ')[0];
            }

            // console.log(resultado)
            return { success: true, data: resultado };
        } catch(e) {
            return { success: false, message: e };
        }
    },

    modificarEstadoByAdmin: async(idAdmin, id, usuario) => {
        // console.log(idAdmin, id, usuario)
        try {
            const [response] = await pool.query('CALL estado_cuenta(?,?,?)', [idAdmin, id, usuario]);
            resultado = response[0][0]

            // console.log(resultado)

            return { success: true }
        } catch(e) {
            return { success: false, menssage: e }
        }
    },
}

module.exports = UserModel;