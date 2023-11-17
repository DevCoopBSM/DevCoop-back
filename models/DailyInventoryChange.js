const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DailyInventoryChange', {
    change_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    change_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    added_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    removed_qty: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    reason: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'DailyInventoryChange',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "change_id" },
        ]
      },
    ]
  });
};
