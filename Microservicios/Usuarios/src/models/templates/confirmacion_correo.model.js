const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const ConfirmacionCorreo = sequelize.define("ConfirmacionCorreo", {
        id_confirmacion: {
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
        correo_confirmado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        fecha_confirmacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        codigo_confirmacion: {
            type: DataTypes.STRING(150),
        },
        caducidad: {
            type: DataTypes.STRING(30),
        },
    }, {
        tableName: 'confirmacion_correo',
        timestamps: false
    });

    return ConfirmacionCorreo;
}