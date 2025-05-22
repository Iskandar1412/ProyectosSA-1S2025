const { Sequelize, DataTypes } = require('sequelize');
const { DATABASE_HOST, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, TABLE_PRODUCTOS } = require('../config/env/db.config');
// const { pool } = require('../config/db');
const Paises  = require('../utils/paises');
const { GestionProductos } = require('./commands/productos.querys');

const sequelize = new Sequelize(TABLE_PRODUCTOS, DATABASE_MYSQL_USER, DATABASE_MYSQL_PASSWORD, {
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

const Categorias = require('./templates/categorias.model')(sequelize, DataTypes);
const Marcas = require('./templates/marcas.model')(sequelize, DataTypes);
const Regiones = require('./templates/regiones.model')(sequelize, DataTypes);
const Productos = require('./templates/productos.model')(sequelize, DataTypes);
const Productos_Imagenes = require('./templates/productos_imagenes.model')(sequelize, DataTypes);
const Productos_Region = require('./templates/productos_region.model')(sequelize, DataTypes);
const Recomendaciones = require('./templates/recomendaciones.model')(sequelize, DataTypes);
const Departamentos = require('./templates/departamento.model')(sequelize, DataTypes);
const Promociones = require('./templates/promocion.model')(sequelize, DataTypes);
const Promocion_Productos = require('./templates/promocion_productos.model')(sequelize, DataTypes);
// const LikeProductos = require('./templates/promocion_productos.model')(sequelize, DataTypes);

async function addRegiones() {
    const nombresPaises = Object.keys(Paises);
    let erroresAgregarRegion = 0;
    try {
        for (const pais of nombresPaises) {
            const data = await new GestionProductos().agregarRegiones(pais)
            if(!data.success) { 
                erroresAgregarRegion += 1
                continue
            }
        }
        console.log(`Total regiones ${nombresPaises.length} - Errores (repetidos): ${erroresAgregarRegion}`)
    } catch(e) { console.log("Error al agregar regiones:", e) }
}

async function addDepartamentos() {
    try {
        let erroresAgregarRegion = 0
        let totalDepartamentos = 0
        for (const pais of Object.keys(Paises)) {
            const departamentos = Paises[pais];
            for (const departamento of departamentos) {
                totalDepartamentos += 1
                const data = await new GestionProductos().agregarDepartamentos(pais, departamento)
                if(!data.success) { 
                    erroresAgregarRegion += 1
                    continue
                }        
            }
        }
        console.log(`Total departamentos insertar ${totalDepartamentos} - Errores (Agregar): ${erroresAgregarRegion}`)
    } catch (error) {
        console.error('Ocurrió un error al procesar los países:', error);
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

            console.log("Agregando regiones");
            await addRegiones();
            console.log("Fin agregado...");

            console.log("Agregando departamentos");
            await addDepartamentos();
            console.log("Fin agregado...");
        }
    } catch(e) {
        console.log('Error en la ejecución de funciones', e);
    }
})();

module.exports = {
    sequelize,
    Categorias,
    Marcas,
    Regiones,
    Productos,
    Productos_Imagenes,
    Productos_Region,
    Recomendaciones,
    Departamentos,
    Promociones,
    Promocion_Productos,
}