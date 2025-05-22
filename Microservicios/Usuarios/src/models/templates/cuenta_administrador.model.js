module.exports = (sequelize, DataTypes) => {
    const CuentaAdministrador = sequelize.define("CuentaAdministrador", {
        id_administrador: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario',
            }
        }
    }, {
        tableName: 'cuenta_administrador',
        timestamps: false
    });

    return CuentaAdministrador;
}