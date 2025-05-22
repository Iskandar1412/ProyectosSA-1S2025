module.exports = (sequelize, DataTypes) => {
    const Ordenes = sequelize.define("Ordenes", {
        id_orden: {
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
        fecha_orden: {
            type: DataTypes.DATE,
            allowNull: false
        },
        estado: {
            type: DataTypes.ENUM('PENDIENTE', 'PROCESANDO', 'ENVIADO', 'ADUANAS', 'ENTREGADO'),
            allowNull: false,
            defaultValue: 'PENDIENTE'
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        cupon_descuento: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        impuestos: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        costo_envio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'ordenes',
        timestamps: false
    });

    return Ordenes;
}
