module.exports = (sequelize, DataTypes) => {
    const Regiones = sequelize.define("Regiones", {
        id_region: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
    }, {
        tableName: 'regiones',
        timestamps: false
    });

    return Regiones;
}