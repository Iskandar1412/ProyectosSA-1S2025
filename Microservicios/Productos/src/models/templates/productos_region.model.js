module.exports = (sequelize, DataTypes) => {
    const Productos_Region = sequelize.define("Productos_Region", {
        id_producto_region: {
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
        id_region: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "regiones",
                key: "id_region"
            }
        },
    }, {
        tableName: 'productos_region',
        timestamps: false
    });

    return Productos_Region;
}