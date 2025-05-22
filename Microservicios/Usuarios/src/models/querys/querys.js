const { pool } = require("../../config/db");
const bcrypt = require('bcrypt'); // npm i bcrypt
const SendMail = require("../../config/mail");
const { sendImageS3 } = require("../../config/sendImageS3");

class Iniciales {
    async agregarRol(rol) {
        try {
            const [peticion] = await pool.promise().query('SELECT COUNT(*) as count FROM rol WHERE rol = ?', [rol]);

            if (peticion[0].count === 0) {
                const query = `INSERT INTO rol(rol) VALUES (?)`;
                await pool.promise().query(query, [rol]);
                console.log(`Rol ${rol} agregado correctamente.`);
            } else {
                console.log(`El rol ${rol} ya existe.`);
            }
        } catch (e) {
            console.log('Error al agregar rol:', e);
        }
    }

    async agregarDescuentos(min, max, des) {
        try {
            const [peticion] = await pool.promise().query('SELECT COUNT(*) AS count FROM descuentos WHERE porcentaje_descuento = ? AND rango_compra_min = ? AND rango_compra_max = ?', [des, min, max]);

            if (peticion[0].count === 0) {
                const query = `INSERT INTO descuentos(rango_compra_min, rango_compra_max, porcentaje_descuento) VALUES (?, ?, ?)`;
                await pool.promise().query(query, [min, max, des]);
                console.log(`Descuento min: ${min}$ - max: ${max}$ - descuento: ${des}% Agregado`);
            } else {
                console.log(`Descuento min: ${min}$ - max: ${max}$ - descuento: ${des}% Existente`);
            }
        } catch (e) {
            console.log('Error al agregar descuento:', e);
        }
    }
}

class GestionUsuarios {
    obtenerCodigoVerificacion() {
        const verificacionCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracionCode = Date.now() + 2 * 60 * 1000;
        return {verificacion: verificacionCode, expiracion: expiracionCode}
    }

    async buscarUsuarioLogin(credenciales) {
        try {
            const queryVerificarInicio = `
                SELECT u.id_usuario, u.contrasenia, r.rol, cc.correo_confirmado, ca.activa
                FROM usuario u
                JOIN rol r ON u.id_rol = r.id_rol
                JOIN cuenta_activa ca ON ca.id_usuario = u.id_usuario
                JOIN confirmacion_correo cc ON cc.id_usuario = u.id_usuario
                WHERE (u.username = ? OR u.correo = ?)
            `
            const [obtenerDatos] = await pool.promise().query(
                queryVerificarInicio,
                [credenciales, credenciales]
            )

            if(obtenerDatos.length === 0) {
                return { success: false, message: 'Usuario no encontrado' }
            }
            // console.log(obtenerDatos)
            if(!obtenerDatos[0].correo_confirmado) {
                const query = `
                    SELECT u.id_usuario, u.correo, u.username, u.contrasenia, r.rol, cc.correo_confirmado, ca.activa
                    FROM usuario u
                    JOIN rol r ON u.id_rol = r.id_rol
                    JOIN cuenta_activa ca ON ca.id_usuario = u.id_usuario
                    JOIN confirmacion_correo cc ON cc.id_usuario = u.id_usuario
                    WHERE (u.username = ? OR u.correo = ?)
                `
                const [consulta] = await pool.promise().query(
                    query,
                    [credenciales, credenciales]
                )

                return { success: true, message: consulta[0] }
            } else {
                const query = `
                    SELECT JSON_OBJECT(
                        'id_usuario', u.id_usuario,
                        'rol', r.rol,
                        'nombre', u.nombre,
                        'apellido', u.apellido,
                        'correo', u.correo,
                        'username', u.username,
                        'contrasenia', u.contrasenia,
                        'telefono', u.telefono,
                        'genero', u.genero,
                        'fecha_nacimiento', u.fecha_nacimiento,
                        'fecha_creacion', u.fecha_creacion,
                        'foto', u.foto,
                        'correo_confirmado', cc.correo_confirmado,
                        'activa', ca.activa,
                        'direcciones', (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'ciudad', d.ciudad,
                                    'departamento', d.departamento
                                )
                            )
                            FROM direccion d 
                            WHERE d.id_usuario = u.id_usuario
                        )
                    ) AS Perfil
                    FROM usuario u
                    JOIN rol r ON u.id_rol = r.id_rol
                    JOIN cuenta_activa ca ON ca.id_usuario = u.id_usuario
                    JOIN confirmacion_correo cc ON cc.id_usuario = u.id_usuario
                    WHERE (u.username = ? OR u.correo = ?)
                `
                const [consulta] = await pool.promise().query(
                    query,
                    [credenciales, credenciales]
                )

                return { success: true, message: consulta[0].Perfil }
            }
        } catch(e) {
            console.log(e)
        }

    }
            
    async buscarUsuario(credenciales) {
        try {
            const query = `
                SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.username, r.rol
                FROM usuario u
                LEFT JOIN rol r ON u.id_rol = r.id_rol
                WHERE (u.username = ? OR u.correo = ?);
            `;
            const [response] = await pool.promise().query(query, [credenciales, credenciales]);
    
            if (response.length > 0) {
                return response[0];
            } else {
                console.log('Usuario no encontrado');
                return null;
            }
        } catch (e) {
            console.log(e);
        }
    }

    async buscarRol(rol) {
        try {
            const [res] = await pool.promise().query(
                'SELECT id_rol FROM rol WHERE rol = ?',
                [rol]
            );
    
            if (res.length > 0) {
                return res[0].id_rol;
            } else {
                throw new Error('Rol no encontrado');
            }
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
    
    async creacionUsuarios(nombre, apellido, correo, username, telefono, genero, fecha_nacimiento, foto, contrasenia, ciudad, departamento, rol) {
        try {
            const rondas = 10;
            const hashPass = await bcrypt.hash(contrasenia, rondas);
            const imagen = await sendImageS3(username, foto);
            const { verificacion, expiracion } = this.obtenerCodigoVerificacion();
    
            const verificarQuery = `
                SELECT COUNT(*) AS count
                FROM usuario
                WHERE telefono = ? OR correo = ? OR username = ?
            `;
            const [peticion] = await pool.promise().query(verificarQuery, [telefono, correo, username]);
    
            if (peticion[0].count !== 0) {
                return { success: false, message: 'Usuario existente' }
            }
    
            const idRol = await this.buscarRol(rol);
    
            const queryCrearUsuario = `
                INSERT INTO usuario(id_rol, nombre, apellido, correo, username, contrasenia, telefono, genero, fecha_nacimiento, foto)       
                VALUES (?,?,?,?,?,?,?,?,?,?)
            `;
    
            const [result] = await pool.promise().query(
                queryCrearUsuario,
                [idRol, nombre, apellido, correo, username, hashPass, telefono, genero, fecha_nacimiento, imagen.path]
            );
    
            if (result.affectedRows === 0) {
                throw new Error('No se pudo crear el usuario');
            }
    
            const usuarioCreado = await this.buscarUsuario(username);
            if (!usuarioCreado) {
                return { success: false, message: "Usuario no encontrado después de su creación"}
            }

            await pool.promise().query(
                'INSERT INTO direccion(ciudad, departamento, id_usuario) VALUES(?,?,?)',
                [ciudad, departamento, usuarioCreado.id_usuario]
            );

            await pool.promise().query(
                'INSERT INTO confirmacion_correo(id_usuario, codigo_confirmacion, caducidad) VALUES(?,?,?)',
                [usuarioCreado.id_usuario, verificacion, expiracion]
            );

            await pool.promise().query(
                "INSERT INTO cuenta_activa(id_usuario) VALUES(?)",
                [usuarioCreado.id_usuario]
            );
    
            if (rol === 'user') {
                await pool.promise().query(
                    'INSERT INTO cuenta_usuario(id_usuario) VALUES(?)',
                    [usuarioCreado.id_usuario]
                )
            } else if (rol === 'admin') {
                await pool.promise().query(
                    'INSERT INTO cuenta_administrador(id_usuario) VALUES(?)',
                    [usuarioCreado.id_usuario]
                )
            }
    
            const htmlSend = `<p><strong>${username}</strong>: Su cuenta fue creada exitosamente</br><strong>Código activación:</strong> ${verificacion}</br></br>Tiene 2 minutos para el ingreso de la verificación; inicie sesión para activar su cuenta.</br></br>Bienvenido!! :D</p>`;
            const usuario = await SendMail(correo, `${username}: Cuenta Creada exitosamente`, htmlSend);
            if (!usuario.success) {
                return { success: false, message: 'Error al enviar el correo' };
            }
            
            return { success: true };
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async crearUsuario(nombre, apellido, correo, username, telefono, genero, fecha_nacimiento, foto, contrasenia, ciudad, departamento) {
        try {
            const res = await this.creacionUsuarios(nombre, apellido, correo, username, telefono, genero, fecha_nacimiento, foto, contrasenia, ciudad, departamento, 'user');
            if(res.success) {
                return res
            }
            return { success: false, message: res.message }
        } catch (e) {
            console.log(e);
            return { success: false, message: e }
        }
    }
    
    async crearAdministrador(nombre, apellido, correo, username, telefono, genero, fecha_nacimiento, foto, contrasenia, ciudad, departamento) {
        try {
            const res = await this.creacionUsuarios(nombre, apellido, correo, username, telefono, genero, fecha_nacimiento, foto, contrasenia, ciudad, departamento, 'admin');
            if(res.success) {
                return res
            }
            return { success: false, message: res.message }
        } catch (e) {
            console.log(e);
            return { success: false, message: e }
        }
    }

    async inicioSesionUsuario(id_usuario, refresh) {
        // console.log(id_usuario, refresh)
        try {
            const [salida] = await pool.promise().query(
                'INSERT INTO inicio_sesion(id_usuario, refresh_token) VALUES(?,?)',
                [id_usuario, refresh]
            );

            if(salida.affectedRows === 0) {
                return { success: false }
            }
            return { success: true }
        } catch(e) {
            return { success: false, message: e }
        }
    }

    async cierreSesionUsuario(token) {
        try {
            const [obtenerUsuario] = await pool.promise().query(
                'SELECT id_usuario FROM inicio_sesion WHERE refresh_token = ?',
                [token]
            )

            if(obtenerUsuario[0].length === 0) {
                return { success: false }
            }
            
            await pool.promise().query(
                'DELETE FROM inicio_sesion WHERE id_usuario = ?',
                [obtenerUsuario[0].id_usuario]
            )

            return { success: true }
        } catch (e) {
            return { success: false, message: e }
        }
    }

    async modificarActivoUsuario(idAdmin, idUsuario, nuevoEstado) {
        try {
            const [res] = await pool.promise().query(
                `
                SELECT u.id_usuario 
                FROM usuario u
                JOIN rol r ON r.id_rol = u.id_rol
                JOIN cuenta_administrador ca ON ca.id_usuario = u.id_usuario
                WHERE r.rol = 'admin' AND u.id_usuario = ?
                `,
                idAdmin
            )

            if(res[0].length === 0) {
                return { success: false, message: 'No es administrador' }
            }

            await pool.promise().query(
                'UPDATE cuenta_activa SET activa = ? WHERE id_usuario = ?',
                [nuevoEstado, idUsuario]
            )

            return { success: true }
        } catch(e) {
            return { success: false, message: e }
        }
    }

    async reenviarCodigoActivacion(id) {
        const { verificacion, expiracion } = this.obtenerCodigoVerificacion();
        // console.log(id)
        try {
            const [UsuarioExistente] = await pool.promise().query(
                `
                    SELECT u.correo, u.username, u.id_usuario 
                    FROM usuario u 
                    JOIN confirmacion_correo cc ON cc.id_usuario = u.id_usuario
                    WHERE u.id_usuario = ? AND cc.correo_confirmado = false
                `,
                [id]
            )

            if(UsuarioExistente.length === 0) return { success: false, message: 'Usuario con cuenta activa' }

            await pool.promise().query(
                'UPDATE confirmacion_correo SET codigo_confirmacion = ?, caducidad = ? WHERE id_usuario = ?',
                [verificacion, expiracion, id]
            )
            
            const htmlSend = `<p><strong>${UsuarioExistente[0].username}</strong>: Cambio de <strong>Código activación:</strong> ${verificacion}</br></br>Tiene 2 minutos para el ingreso de la verificación.</p>`
            const usuario = await SendMail(UsuarioExistente[0].correo, `${UsuarioExistente[0].username}: Cambio de código de activación`, htmlSend);
            if (!usuario.success) {
                return { success: false, message: usuario.message };
            }
            return { success: true }
        } catch(e) {
            console.log(e)
            return { success: false, message: e }
        }
    }

    async activarCuenta(id, codigo) {
        try {
            const [obtenerUsuario] = await pool.promise().query(
                `
                    SELECT u.id_usuario, u.username, u.correo, cc.codigo_confirmacion, cc.caducidad
                    FROM usuario u
                    JOIN confirmacion_correo cc ON u.id_usuario = cc.id_usuario
                    WHERE cc.correo_confirmado = false AND u.id_usuario = ?
                `,
                [id]
            );

            if(obtenerUsuario.length === 0) return { success: false, message: 'Cuenta ya activa' }
            if(obtenerUsuario[0].codigo_confirmacion !== codigo) return { success: false, message: 'Código no valido' }

            const ahora = Date.now()
            if(obtenerUsuario[0].caducidad <= ahora) return { success: false, message: 'Error: Código expirado, reenvie otro código' }

            const [activarUsuario] = await pool.promise().query(
                `
                    UPDATE confirmacion_correo cc
                    JOIN usuario u ON u.id_usuario = cc.id_usuario
                    SET cc.correo_confirmado = true, cc.codigo_confirmacion = NULL, cc.caducidad = NULL
                    WHERE u.id_usuario = ?;
                `,
                [id]
            );
            
            if(activarUsuario.affectedRows === 0) return { success: false, message: 'Error en activar cuenta del usuario' }

            const htmlSend = `<p><strong>${obtenerUsuario[0].username}</strong>: Su cuenta ha sido activada exitosamente<strong></p>`
            const correoEnviar = await SendMail(obtenerUsuario[0].correo, `${obtenerUsuario[0].username}: Cuenta activada Exitosamente`, htmlSend);
            if (!correoEnviar.success) {
                return { success: false, message: 'Error en el envio del correo' };
            }
            return { success: true }
        } catch (e) {
            return { success: false, message: e }
        }
    }

    async activarCuentaInicial() {
        try {
            const [obtenerUsuario] = await pool.promise().query(
                `
                    SELECT u.id_usuario, u.username, u.correo, cc.codigo_confirmacion, cc.caducidad
                    FROM usuario u
                    JOIN confirmacion_correo cc ON u.id_usuario = cc.id_usuario
                    WHERE cc.correo_confirmado = false AND u.id_usuario = ?
                `,
                [1]
            );
    
            if(obtenerUsuario.length === 0) return { success: false, message: 'Cuenta ya activa' }
            // if(obtenerUsuario[0].codigo_confirmacion !== codigo) return { success: false, message: 'Código no valido' }
    
            const ahora = Date.now()
            if(obtenerUsuario[0].caducidad <= ahora) return { success: false, message: 'Error: Código expirado, reenvie otro código' }
    
            const [cuentaActivada] = await pool.promise().query(
                `
                    UPDATE confirmacion_correo cc
                    JOIN usuario u ON u.id_usuario = cc.id_usuario
                    SET cc.correo_confirmado = true, cc.codigo_confirmacion = NULL, cc.caducidad = NULL
                    WHERE u.id_usuario = ?
                `,
                [1]
            );
    
            if(cuentaActivada.affectedRows === 0) return { success: false, message: 'Error en activar cuenta del usuario' }
    
                const htmlSend = `<p><strong>${obtenerUsuario[0].username}</strong>: Su cuenta ha sido activada exitosamente<strong></p>`
                const correoEnviar = await SendMail(obtenerUsuario[0].correo, `${obtenerUsuario[0].username}: Cuenta activada Exitosamente`, htmlSend);
                if (!correoEnviar.success) {
                    return { success: false, message: 'Error en el envio del correo' };
                }
                return { success: true }
        } catch(e) {
            return { success: false, message: e }
        }
    }

    async obtenerUsuariosAdministrador(id) {
        try {
            const [verificarAdmin] = await pool.promise().query(
                `
                    SELECT COUNT(*) AS count
                    FROM usuario u
                    JOIN rol r ON r.id_rol = u.id_rol
                    WHERE r.rol = 'admin' AND u.id_usuario = ?
                `,
                [id]
            )

            if(verificarAdmin[0].count !== 1) return { success: false, message: 'No es administrador' }

            const [obtencionUsuariosAdmin] = await pool.promise().query(
                `
                    SELECT u.id_usuario, r.rol, u.nombre, u.apellido, u.correo, u.username, u.telefono, u.genero, u.fecha_nacimiento, u.fecha_creacion, cc.correo_confirmado, ca.activa
                    FROM usuario u
                    JOIN rol r ON u.id_rol = r.id_rol
                    JOIN confirmacion_correo cc ON cc.id_usuario = u.id_usuario
                    JOIN cuenta_activa ca ON ca.id_usuario = u.id_usuario;
                `
            )

            const formatearFecha = (fecha) => {
                return fecha.toISOString().split('T')[0];
            };

            const usuariosFormateados = obtencionUsuariosAdmin.map(usuario => {
                return {
                    ...usuario,
                    fecha_nacimiento: formatearFecha(new Date(usuario.fecha_nacimiento)),
                    fecha_creacion: formatearFecha(new Date(usuario.fecha_creacion))
                };
            });

            return { success: true, data: usuariosFormateados }
        } catch(e) { return { success: false, message: e } }
    }

    async modificarDatosUsuario(id, correo, telefono, direcciones) {
        const conn = await pool.promise().getConnection();
        try {
            await conn.beginTransaction();
    
            const [existentes] = await conn.query(
                `
                    SELECT COUNT(*) AS count
                    FROM usuario 
                    WHERE (correo = ? AND id_usuario != ?) OR (telefono = ? AND id_usuario != ?)
                `,
                [correo, id, telefono, id]
            );
    
            if(existentes[0].count !== 0) {
                await conn.rollback();
                conn.release();
                return { success: false, message: 'Correo o Teléfono ya existente' };
            }
    
            const [updateResult] = await conn.query(
                `
                    UPDATE usuario
                    SET correo = ?, telefono = ?
                    WHERE id_usuario = ? AND (correo != ? OR telefono != ?)
                `,
                [correo, telefono, id, correo, telefono]
            );
    
            await conn.query(
                `DELETE FROM direccion WHERE id_usuario = ?`,
                [id]
            );
    
            if(direcciones && direcciones.length > 0) {
                await Promise.all(direcciones.map(element => 
                    conn.query(
                        `INSERT INTO direccion(ciudad, departamento, id_usuario) VALUES(?,?,?)`,
                        [element.ciudad, element.departamento, id]
                    )
                ));
            }
    
            await conn.commit();
            return { success: true };
    
        } catch (e) {
            await conn.rollback();
            return { 
                success: false, 
                message: e.message || 'Error al actualizar los datos del usuario'
            };
        } finally {
            conn.release();
        }
    }

    async obtenerPerfilUsuario(id) {
        try {
            const [obtenerPerfil] = await pool.promise().query(
                `
                SELECT JSON_OBJECT(
                    'id_usuario', u.id_usuario,
                    'rol', r.rol,
                    'nombre', u.nombre,
                    'apellido', u.apellido,
                    'correo', u.correo,
                    'username', u.username,
                    'telefono', u.telefono,
                    'genero', u.genero,
                    'fecha_nacimiento', u.fecha_nacimiento,
                    'fecha_creacion', u.fecha_creacion,
                    'foto', u.foto,
                    'correo_confirmado', cc.correo_confirmado,
                    'activa', ca.activa,
                    'direcciones', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'ciudad', d.ciudad,
                                'departamento', d.departamento
                            )
                        )
                        FROM direccion d 
                        WHERE d.id_usuario = u.id_usuario
                    )
                ) AS Perfil
                FROM usuario u
                JOIN rol r ON u.id_rol = r.id_rol
                JOIN cuenta_activa ca ON ca.id_usuario = u.id_usuario
                JOIN confirmacion_correo cc ON cc.id_usuario = u.id_usuario
                WHERE u.id_usuario = ?
                `,
                [id]
            )

            return { success: true, data: obtenerPerfil[0].Perfil }
        } catch(e) { return { success: false, message: e } }
    }
}

module.exports = {
    Iniciales,
    GestionUsuarios,
}