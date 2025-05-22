module.exports = (sequelize, DataTypes) => {
    const Categorias = sequelize.define("Categorias", {
        id_categoria: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        descripcion: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
    }, {
        tableName: 'categorias',
        timestamps: false
    });

    return Categorias;
}