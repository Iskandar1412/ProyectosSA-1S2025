module.exports = (sequelize, DataTypes) => {
    const Devoluciones = sequelize.define("Devoluciones", {
        id_devolucion: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        correo_usuario: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        fecha_devolucion: {
            type: DataTypes.DATE,
            allowNull: false
        },
        estado: {
            type: DataTypes.ENUM('PENDIENTE', 'EN PROCESO', 'ACEPTADO', 'RECHAZADO'),
            allowNull: false,
            defaultValue: 'PENDIENTE'
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        codigo_producto: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        motivo_devolucion: {
            type: DataTypes.STRING(80),
            allowNull: false
        },
        precio_producto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        precio_total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'devoluciones',
        timestamps: false
    });

    return Devoluciones;
}
