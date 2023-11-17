// models/inventorySnapshots.js

const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  const InventorySnapshot = sequelize.define(
    'InventorySnapshot',
    {
      snapshot_id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      snapshotDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'InventorySnapshots',
      timestamps: false,
    }
  );
  return InventorySnapshot;
};
