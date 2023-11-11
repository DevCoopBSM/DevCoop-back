const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('charge_log', {
    charge_num: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code_number: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    inner_point: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    point: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    charger_id: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    verify_key: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    student_name: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'charge_log',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "charge_num" },
        ]
      },
    ]
  });
};
