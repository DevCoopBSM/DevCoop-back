const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const Item = sequelize.define('items', {
    item_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    barcode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    item_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    item_price: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'items',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "item_id" },
        ]
      },
    ]
  });

  
  return Item;
};
