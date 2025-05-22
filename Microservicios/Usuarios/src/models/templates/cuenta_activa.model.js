module.exports = (sequelize, DataTypes) => {
    const CuentaActiva = sequelize.define("CuentaActiva", {
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario',
            }
        },
        activa: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        tableName: 'cuenta_activa',
        timestamps: false
    });

    return CuentaActiva;
}