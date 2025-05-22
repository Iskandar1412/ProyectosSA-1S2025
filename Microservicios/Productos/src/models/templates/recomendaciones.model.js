const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Recomendaciones = sequelize.define("Recomendaciones", {
        id_recomendacion: {
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
            allowNull: false,
            references: {
                model: "productos",
                key: "id_producto"
            }
        },
        tipo_recomendacion: {
            type: DataTypes.ENUM('Automatica', 'Historial'),
            allowNull: false,
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
    }, {
        tableName: 'recomendaciones',
        timestamps: false
    });

    return Recomendaciones;
}