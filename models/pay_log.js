const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "pay_log",
    {
      pay_num: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      code_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      type: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      inner_point: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      point: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      charger_id: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      verify_key: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      student_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "pay_log",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "pay_num" }],
        },
      ],
    },
  );
};
