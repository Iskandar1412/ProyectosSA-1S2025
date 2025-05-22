module.exports = (sequelize, DataTypes) => {
    const Rol = sequelize.define("Rol", {
        id_rol: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        rol: {
            type: DataTypes.ENUM('admin', 'user'),
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'rol',
        timestamps: false
    });

    return Rol;
}
