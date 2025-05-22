module.exports = (sequelize, DataTypes) => {
    const Departamentos = sequelize.define("Departamentos", {
        id_departamento: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true
        },
        id_region: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "regiones",
                key: "id_region"
            }
        },
    }, {
        tableName: 'departamentos',
        timestamps: false
    });

    return Departamentos;
}