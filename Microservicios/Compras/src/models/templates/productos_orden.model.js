module.exports = (sequelize, DataTypes) => {
    const Productos_Orden = sequelize.define("Productos_Orden", {
        id_producto_orden: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_orden: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "ordenes",
                key: "id_orden"
            }
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        promocion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        codigo_producto: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        nombre_producto: {
            type: DataTypes.STRING(250),
            allowNull: false,
        },
        precio_unitario: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'productos_orden',
        timestamps: false
    });

    return Productos_Orden;
}
