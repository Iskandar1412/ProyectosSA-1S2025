module.exports = (sequelize, DataTypes) => {
    const Promocion_Productos = sequelize.define("Promocion_Productos", {
        id_promocion_producto: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "productos",
                key: "id_producto"
            }
        },
        id_promocion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "promociones",
                key: "id_promocion"
            }
        },
        fecha_inicio: {
            type: DataTypes.DATE,
        },
        fecha_fin: {
            type: DataTypes.DATE,
        }
    }, {
        tableName: 'promocion_productos',
        timestamps: false
    });

    return Promocion_Productos;
}