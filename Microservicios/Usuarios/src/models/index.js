// const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize'); // npm i sequelize
// const path = require('path');
const { DATABASE_HOST, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, TABLE_USUARIOS } = require('../config/env/db.config');
const { pool } = require('../config/db');
const { Iniciales, GestionUsuarios } = require('./querys/querys');

const sequelize = new Sequelize(TABLE_USUARIOS, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, {
    host: DATABASE_HOST,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    }
});


if (process.env.NODE_ENV !== 'test') {
    sequelize.authenticate()
        .then(() => {
            console.log('Conexión establecida exitosamente');
        })
        .catch((e) => {
            console.log('Error en la conexión con la base de datos:', e);
        });
}

const Rol = require('./templates/roles.model')(sequelize, DataTypes);
const Usuario = require('./templates/usuario.model')(sequelize, DataTypes);
const UsuarioReportado = require('./templates/usuario_reportado.model')(sequelize, DataTypes);
const InicioSesion = require('./templates/inicio_sesion.model')(sequelize, DataTypes);
const Direccion = require('./templates/direccion.model')(sequelize, DataTypes);
const Descuentos = require('./templates/descuentos.model')(sequelize, DataTypes);
const CuentaUsuario = require('./templates/cuenta_usuario.model')(sequelize, DataTypes);
const CuentaAdministrador = require('./templates/cuenta_administrador.model')(sequelize, DataTypes);
const CuentaActiva = require('./templates/cuenta_activa.model')(sequelize, DataTypes);
const ConfirmacionCorreo = require('./templates/confirmacion_correo.model')(sequelize, DataTypes);
const Usuarios_Descuentos = require('./templates/usuario_descuento.model')(sequelize, DataTypes);
const Quejas = require('./templates/quejas.model')(sequelize, DataTypes);

// async function deleteProcedures(path) {
//     try {
//         const sql = fs.readFileSync(path, {encoding: 'utf-8'});
//         const queries = sql.split(';').filter(query => query.trim());
//         await Promise.all(queries.map(query => sequelize.query(query)));
//     } catch(e) {
//         console.log("Error limpieza", e)
//     }
// }

// async function addProcedures(params) {
//     try {
//         const files = fs.readdirSync(params);
//         for (const file of files) {
//             const ruta = path.join(params, file);
//             if(fs.lstatSync(ruta).isDirectory()) {
//                 await addProcedures(ruta);
//             } else if (path.extname(ruta) === '.sql') {
//                 const sql = fs.readFileSync(ruta, {encoding: 'utf-8'});
//                 await sequelize.query(sql);
//                 const archivo_split = ruta.split('/');
//                 const nombre_archivo = archivo_split[archivo_split.length -1];
//                 const formateo = nombre_archivo.padEnd(70, ' ');
//                 console.log(`${formateo}\t\t\t ejecutado`);
//             }
//         }
//     } catch(e) {
//         console.log('Error creación procedimientos', e)
//     }
// }

async function addRoles() {
    try {
        const roles = [
            { "rol": "admin" },
            { "rol": "user" }
        ];

        for (const rol of roles) {
            const [peticion] = await pool.promise().query('SELECT COUNT(*) as count FROM rol WHERE rol = ?', [rol.rol]);
            if(peticion[0].count === 0) {
                await new Iniciales().agregarRol(rol.rol);
                // console.log(`Rol ${rol.rol} creado.`);
            } else {
                console.log(`Rol ${rol.rol} existente`);
            }
        } 
    } catch(e) {
        console.log('Error en la inserción de roles:', e);
    }
}

async function addDescuentos() {
    try {
        const descuentos = [
            { "min": 10000, "max": 12999, "des": 5 },
            { "min": 13000, "max": 16999, "des": 10 },
            { "min": 17000, "max": 99999, "des": 20 }
        ];

        for (const descuento of descuentos) {
            const [peticion] = await pool.promise().query(
                'SELECT COUNT(*) AS count FROM descuentos WHERE porcentaje_descuento = ? AND rango_compra_min = ? AND rango_compra_max = ?',
                [descuento.des, descuento.min, descuento.max]
            );

            if (peticion[0].count === 0) {
                await new Iniciales().agregarDescuentos(descuento.min, descuento.max, descuento.des);
                console.log(`Descuento agregado para el rango ${descuento.min} - ${descuento.max} con ${descuento.des}%`);
            } else {
                console.log(`Descuento ya existente para el rango ${descuento.min} - ${descuento.max} con ${descuento.des}%`);
            }
        }
    } catch (e) {
        console.error('Error al agregar los descuentos:', e);
    }
}

async function addAdministradorInicial() {
    try {
        const usuario = {
            "p_nombre": "Admin",
            "p_apellido": "Admin",
            "p_correo": "silvapaco810@gmail.com",
            "p_username": "iskandar",
            "p_telefono": "55734366",
            "p_genero": "M",
            "p_fecha_nacimiento": "2000-09-13",
            "p_imagen": null,
            "p_contrasenia": "123",
            "p_ciudad": "Guatemala",
            "p_departamento": "Guatemala"
        }
    
        const [peticion] = await pool.promise().query(
            `
                SELECT COUNT(*) AS count FROM usuario u WHERE u.correo = ? 
            `,
            [usuario.p_correo]
        )
    
        if(peticion[0].count !== 0) { console.log('Usuario ya existente'); return; }
    
        const crearUsuario = await new GestionUsuarios().crearAdministrador(
            usuario.p_nombre,
            usuario.p_apellido,
            usuario.p_correo,
            usuario.p_username,
            usuario.p_telefono,
            usuario.p_genero,
            usuario.p_fecha_nacimiento,
            usuario.p_imagen,
            usuario.p_contrasenia,
            usuario.p_ciudad, 
            usuario.p_departamento
        )
        
        if(!crearUsuario.success) {
            console.log("Eror en la creación del usuario")
            return
        }

        const activarCuenta = await new GestionUsuarios().activarCuentaInicial()
        if(!activarCuenta.success) {
            console.log(activarCuenta.message)
            return
        }
        console.log("Cuenta Administrador activada correctamente")
    } catch(e) {
        console.log('Error en la creación usuario administrador (Principal):', e)
    }
}

(async function() {
    try {
        // await sequelize.drop();
        // console.log('Tablas eliminadas exitosamente');
        // force: true // recrea las tablas (perdida datos)
        // alter: true // modificaciones (modifica las tablas)
        if(process.env.NODE_ENV !== 'test') {
            await sequelize.sync({force: false})
            .then(() => { console.log('OK: Tablas Creadas o Modificadas Exitosamente') })
            .catch((e) => { console.log('Error:', e) });

            console.log("Creando roles");
            await addRoles();
            console.log("Fin Creación...");

            console.log("Creando descuentos");
            await addDescuentos();
            console.log("Fin Creación...");

            console.log("Creando Usuario Administrador");
            await addAdministradorInicial();
            console.log("Fin Creación...");
        }
    } catch(e) {
        console.log('Error en la ejecución de funciones', e);
    }
})();

module.exports = {
    sequelize,
    Usuario,
    UsuarioReportado,
    Rol,
    InicioSesion,
    Direccion,
    Descuentos,
    CuentaUsuario,
    CuentaAdministrador,
    CuentaActiva,
    ConfirmacionCorreo,
    Usuarios_Descuentos,
    Quejas,
};