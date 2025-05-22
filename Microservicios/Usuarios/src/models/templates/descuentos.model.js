module.exports = (sequelize, DataTypes) => {
    const Descuentos = sequelize.define("Descuentos", {
        id_descuento: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        rango_compra_min: {
            type: DataTypes.DECIMAL(10, 2),
        },
        rango_compra_max: {
            type: DataTypes.DECIMAL(10, 2),
        },
        porcentaje_descuento: {
            type: DataTypes.DECIMAL(5, 2),
        },
    }, {
        tableName: 'descuentos',
        timestamps: false
    });

    return Descuentos;
}