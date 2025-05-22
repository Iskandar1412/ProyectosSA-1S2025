module.exports = (sequelize, DataTypes) => {
    const Direccion = sequelize.define("Direccion", {
        id_direccion: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        ciudad: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        departamento: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        }
    }, {
        tableName: 'direccion',
        timestamps: false
    });

    return Direccion;
}
