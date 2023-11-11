const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class InventorySnapshot extends Model {}

  InventorySnapshot.init({
    inventorySnapshotId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inventory', // 'inventory' 모델(테이블)을 참조합니다.
        key: 'id', // 'inventory' 테이블의 기본키를 참조합니다.
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    snapshotDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'InventorySnapshot',
    tableName: 'inventory_snapshots', // 실제 데이터베이스의 테이블 이름
    timestamps: false, // createdAt과 updatedAt 컬럼을 사용하지 않을 경우 false로 설정
  });

  return InventorySnapshot;
};
