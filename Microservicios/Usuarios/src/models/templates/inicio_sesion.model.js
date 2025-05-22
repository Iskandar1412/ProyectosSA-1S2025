const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const InicioSesion = sequelize.define("InicioSesion", {
        id_inicio: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario',
            }
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        refresh_token: {
            type: DataTypes.STRING(400),
            allowNull: false,
        },
    }, {
        tableName: 'inicio_sesion',
        timestamps: false
    });

    return InicioSesion;
}