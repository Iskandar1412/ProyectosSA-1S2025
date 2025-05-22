module.exports = (sequelize, DataTypes) => {
    const Favoritos = sequelize.define("Favoritos", {
        id_favorito: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        correo_usuario: {
            type: DataTypes.STRING(150),
            allowNull: false,
        }
    }, {
        tableName: 'favoritos',
        timestamps: false
    });

    return Favoritos;
}
