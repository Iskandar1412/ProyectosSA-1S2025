module.exports = (sequelize, DataTypes) => {
    const Promociones = sequelize.define("Promociones", {
        id_promocion: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        porcentaje: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
        },
    }, {
        tableName: 'promociones',
        timestamps: false
    });

    return Promociones;
}