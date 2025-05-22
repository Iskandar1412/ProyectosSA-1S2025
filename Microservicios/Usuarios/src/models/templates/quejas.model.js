const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Quejas = sequelize.define("Quejas", {
        id_queja: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        tipo_queja: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        estado: {
            type: DataTypes.ENUM('PENDIENTE', 'RESUELTO', 'RECHAZADO'),
            defaultValue: 'PENDIENTE'
        },
    }, {
        tableName: 'quejas',
        timestamps: false,
    });

    return Quejas;
}