module.exports = (sequelize, DataTypes) => {
    const Marcas = sequelize.define("Marcas", {
        id_marca: {
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
        tableName: 'marcas',
        timestamps: false
    });

    return Marcas;
}