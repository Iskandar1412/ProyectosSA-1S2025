module.exports = (sequelize, DataTypes) => {
    const CuentaUsuario = sequelize.define("CuentaUsuario", {
        id_cuenta_usuario: {
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
        tableName: 'cuenta_usuario',
        timestamps: false
    });

    return CuentaUsuario;
}