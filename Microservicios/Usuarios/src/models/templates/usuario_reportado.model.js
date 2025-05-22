const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const UsuarioReportado = sequelize.define("UsuarioReportado", {
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        motivo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM('Revisión', 'Resuelto'),
            allowNull: false
        },
        fecha_reporte: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
    }, {
        tableName: 'usuario_reportado',
        timestamps: false
    });

    return UsuarioReportado;
}