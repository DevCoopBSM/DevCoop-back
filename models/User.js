const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://root:phj@3473@localhost:3306/AriPay');

const User = sequelize.define('users', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    student_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    student_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    point: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_admin: {
        type: DataTypes.TINYINT,
        allowNull: false
    }
}, {
    // id 컬럼 자동 생성 방지
    freezeTableName: true,
    timestamps: false
});

module.exports = User; 