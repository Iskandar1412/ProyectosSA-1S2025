const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Productos_Imagenes = sequelize.define("Productos_Imagenes", {
        id_imagen: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "productos",
                key: "id_producto"
            }
        },
        url_imagen: {
            type: DataTypes.STRING(250),
            allowNull: false,
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
    }, {
        tableName: 'productos_imagenes',
        timestamps: false
    });

    return Productos_Imagenes;
}