const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Usuario = sequelize.define("Usuario", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        apellido: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        correo: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        username: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        telefono: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        genero: {
            type: DataTypes.ENUM('Masculino', 'Femenino'),
            allowNull: false
        },
        fecha_nacimiento: {
            type: DataTypes.DATE,
            allowNull: false
        },
        url_profile: {
            type: DataTypes.STRING(255)
        },
        contrasenia: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        cuenta_activada: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        verificacion_correo: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        codigo_activacion: {
            type: DataTypes.STRING(30),
        },
        tiempo_expiracion_codigo: {
            type: DataTypes.STRING(30),
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        refresh_token: {
            type: DataTypes.STRING(350),
        },
        rol_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "roles",
                key: "id"
            }
        }
    }, {
        tableName: 'usuarios',
        timestamps: false
    });

    return Usuario;
}