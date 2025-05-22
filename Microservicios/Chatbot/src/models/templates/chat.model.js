const { Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    const ChatHistory = sequelize.define("ChatHistory", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        sender: {
            type: DataTypes.ENUM('user', 'bot'),
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
    }, {
        tableName: 'chat_history',
        timestamps: false
    });

    return ChatHistory;
};
