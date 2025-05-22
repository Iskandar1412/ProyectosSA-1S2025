module.exports = (sequelize, DataTypes) => {
    const Pagos = sequelize.define("Pagos", {
        id_pago: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        codigo_pago: {
            type: DataTypes.STRING(10),
            unique: true,
            allowNull: false
        },
        id_compra: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        usuario: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        fecha_pago: {
            type: DataTypes.DATE,
            allowNull: false
        },
        tipo_pago_1: {
            type: DataTypes.ENUM('Credito', 'Debito'),
            allowNull: false,
        },
        no_tarjeta_1: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        porcentaje_1: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 100
        },
        tipo_pago_2: {
            type: DataTypes.ENUM('N/A', 'Credito', 'Debito'),
            defaultValue: 'N/A'
        },
        no_tarjeta_2: {
            type: DataTypes.STRING(15),
        },
        porcentaje_2: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        cupon_descuento: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'pagos',
        timestamps: false
    });

    return Pagos;
}
