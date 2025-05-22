module.exports = (sequelize, DataTypes) => {
    const LikeProductos = sequelize.define("LikeProductos", {
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "productos",
                key: "id_producto"
            }
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        tableName: 'like_productos',
        timestamps: false
    });

    return LikeProductos;
}