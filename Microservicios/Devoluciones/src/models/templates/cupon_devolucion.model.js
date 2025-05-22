module.exports = (sequelize, DataTypes) => {
    const CuponDevolucion = sequelize.define("CuponDevolucion", {
        id_devolucion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "devoluciones",
                key: "id_devolucion"
            }
        },
        valor_precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        usado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'cupon_devolucion',
        timestamps: false
    });

    return CuponDevolucion;
}
