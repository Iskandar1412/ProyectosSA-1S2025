const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Usuarios_Descuentos = sequelize.define("Usuarios_Descuentos", {
        id_descuento_usuario: {
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
        id_descuento: {
            type: DataTypes.INTEGER,
            references: {
                model: 'descuentos',
                key: 'id_descuento'
            }
        },
        fecha_asignacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        fecha_caducidad: {
            type: DataTypes.DATE,
            allowNull: false
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
    }, {
        tableName: 'usuarios_descuentos',
        timestamps: false,
        hooks: {
            beforeCreate: (descuento, options) => {
                const fechaCaducidad = new Date(descuento.fecha_obtenida);
                fechaCaducidad.setDate(fechaCaducidad.getDate() + 30);
                descuento.fecha_caducidad = fechaCaducidad;
            }
        }
    });

    return Usuarios_Descuentos;
}