const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Productos = sequelize.define("Productos", {
        id_producto: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_categoria: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "categorias",
                key: "id_categoria"
            }
        },
        id_marca: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "marcas",
                key: "id_marca"
            }
        },
        codigo: {
            type: DataTypes.STRING(10),
            defaultValue: false,
            unique: true,
        },
        creado_por: { // id del usuario
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(250),
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.STRING(600),
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
        },
        cantidad: {
            type: DataTypes.INTEGER,
        },
        disponibilidad: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
    }, {
        tableName: 'productos',
        timestamps: false
    });

    return Productos;
}