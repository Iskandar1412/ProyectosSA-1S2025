const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Usuario = sequelize.define("Usuario", {
        id_usuario: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_rol: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'rol',
                key: 'id_rol'
            },
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
        contrasenia: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        telefono: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        genero: {
            type: DataTypes.ENUM('M', 'F'),
            allowNull: false
        },
        fecha_nacimiento: {
            type: DataTypes.DATE,
            allowNull: false
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        foto: {
            type: DataTypes.STRING(255)
        }
    }, {
        tableName: 'usuario',
        timestamps: false
    });

    return Usuario;
}