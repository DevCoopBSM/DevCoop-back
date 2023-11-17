const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('temp_receipt', {
    number: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    dcm_sale_amt: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sale_yn: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    bill_num: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    sale_qty: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'temp_receipt',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "number" },
        ]
      },
    ]
  });
};
