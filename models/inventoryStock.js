const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('inventoryStock', {
    inventoryStock_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    in_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    out_quantity: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    store_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'inventoryStock',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "inventoryStock_id" },
        ]
      },
    ]
  });
};
